import * as dotenv from 'dotenv'
dotenv.config()

import Debug from 'debug'
const debug = Debug('qq_server')
const DEBUG = process.env.DEBUG
debug('DEBUG', DEBUG)

import cors from '@koa/cors'
import Router from '@koa/router'
import Koa from 'koa'
import koaBody from 'koa-body'
import websockify from 'koa-websocket'
import {
    Client,
    core,
    createClient,
    MessageRet,
    Quotable,
    Sendable,
} from 'oicq'
import {
    assert,
    checkHealthCode,
    ExposeError,
    getSpecifiedData,
    groupFilterGenerator,
    Timer,
} from './util'
import { ocr } from 'tencentcloud-sdk-nodejs'
import WebSocket from 'ws'
import { inspect } from 'util'
import fs from 'fs/promises'

declare module 'oicq' {
    interface Client {
        hasFriend(id: string | number): boolean
        hasGroup(id: string | number): boolean
    }
}

Client.prototype.hasFriend = function (this: Client, id) {
    return !!this.pickFriend(+id).info
}
Client.prototype.hasGroup = function (this: Client, id) {
    return !!this.pickGroup(+id).info
}

let clients: {
    [key: string]: Client
} = {}

if (process.env.testBot) {
    const client = createClient(+process.env.testBot, {
        platform: 3,
    })
    client.once('system.online', () => {
        debug('Logged in!')
        clients[client.uin] = client
    })
    client.login()
}

// https://cloud.tencent.com/act/event/ocrdemo
const ocrClient = new ocr.v20181119.Client({
    credential: {
        secretId: process.env.secretId,
        secretKey: process.env.secretKey,
    },
    region: 'ap-shanghai',
    profile: {
        httpProfile: {
            endpoint: 'ocr.tencentcloudapi.com',
        },
    },
})

const app = websockify(new Koa())
app.use(koaBody())
app.use(
    cors({
        origin: '*',
        allowMethods: 'POST',
        allowHeaders: 'content-type',
    })
)

enum TargetType {
    Private = 'private',
    Group = 'group',
}

const targetTypeMap = {
    group: 'sendGroupMsg',
    private: 'sendPrivateMsg',
}

const wsRouter = new Router()
wsRouter.get('/qrcodeLogin', ctx => {
    let client: Client

    ctx.websocket.on('message', message => {
        const account = +message

        if (clients[account]) {
            debug(`Bot ${account} already logged in!`)
            ctx.websocket.send('online')
            ctx.websocket.close()
            return
        }

        client = createClient(account, {
            platform: 3,
        })

        client.on('system.login.qrcode', async ({ image }) => {
            ctx.websocket.send(image)

            const polling = () =>
                setTimeout(async function () {
                    // debug('qrcodePolling()')
                    if (!client) return

                    const { retcode } = await client.queryQrcodeResult()

                    retcode === core.QrcodeResult.WaitingForScan ||
                        retcode === core.QrcodeResult.WaitingForConfirm
                        ? polling()
                        : client.qrcodeLogin()
                }, 1000)

            polling()
        })

        client.once('system.online', () => {
            debug('Logged in!')
            clients[client.uin] = client
            ctx.websocket.send('online')
            ctx.websocket.close()
        })

        client.login()
    })

    setTimeout(() => {
        ctx.websocket.send('timeout')
        ctx.websocket.close()
    }, 1000 * 60 * 10)

    ctx.websocket.onclose = () => {
        client = null //释放资源所必需
        debug('WebSocket Close!')
    }
})

wsRouter.get('/wsState', async ctx => {
    ctx.websocket.on('ping', () => {
        ctx.websocket.send(inspect(ctx.websocket))
        ctx.websocket.close()
    })
})

app.ws.use(wsRouter.routes() as any)

const router = new Router()
// router.post('/api', async ctx => {
//     const body = ctx.request.body
//     debug(body)

//     assert(
//         body.botId && clients[body.botId] && body.method && body.args,
//         '参数错误'
//     )

//     try {
//         ctx.body = await clients[body.botId]?.[body.method]?.(...body.args)
//     } catch (err) {
//         ctx.status = 400
//         ctx.body = err
//     }
// })

router.get('/wsState', async ctx => {
    const ws = new WebSocket('ws://localhost:7654/wsState')
    const state = await new Promise(resolve => {
        ws.onopen = () => ws.ping()
        ws.onmessage = e => {
            const { data } = e
            const s = data.toString()
            resolve(s.slice(s.indexOf('{')))
        }
    })

    ctx.body = state
})

router.get('/bots', async ctx => {
    const a = []
    for (const id in clients) {
        a.push({
            id,
            ...clients[id],
        })
    }
    ctx.body = a
})

router.post('/botLogout', async ctx => {
    const body = ctx.request.body
    debug(body)

    assert(clients[body.botId], 'bot 未登录')

    await clients[body.botId].logout()
    delete clients[body.botId]

    ctx.body = '成功'
})

router.post('/timedMessage', async ctx => {
    const body = ctx.request.body
    debug(body)

    let start = +body.start
    const interval = +body.interval * 1000
    const client = clients[+body.botId]
    const targetId = +body.targetId
    const method = targetTypeMap[body.targetType]
    const message = body.message

    assert(client, 'bot 未登录')

    if (DEBUG) {
        start = Date.now() + 5000
    }

    assert(start && targetId && method && message, '参数错误')
    assert(start > Date.now() + 1000, '开始时间错误')

    debug(new Date(start), new Date())
    debug(start - Date.now())

    new Timer(
        async () => await client[method](targetId, message),
        start,
        interval
    )

    ctx.body = '成功'
})

router.post('/messageForward', async ctx => {
    const body = ctx.request.body
    debug(body)

    const client = clients[+body.botId]
    const sourceMethod = targetTypeMap[body.sourceType]
    const sourceId = +body.sourceId
    const targetMethod = targetTypeMap[body.targetType]
    const targetId = +body.targetId

    assert(client, 'bot 未登录')

    assert(sourceMethod && sourceId && targetMethod && targetId, '参数错误')

    switch (body.sourceType) {
        case 'private':
            client.on('message.private', e => {
                if (e.from_id === sourceId) {
                    client[targetMethod](targetId, e.message)
                }
            })
            break
        case 'group':
            const forwardRule = body.forwardRule
            assert(forwardRule, '缺少转发规则')

            const filter = groupFilterGenerator(forwardRule, body.selectIds)

            client.on('message.group', e => {
                if (
                    e.group_id === sourceId &&
                    filter(e.sender.user_id.toString())
                ) {
                    client[targetMethod](targetId, e.message)
                }
            })

            break
        default:
            throw new ExposeError('未注册的源类型')
    }

    ctx.body = '成功'
})

router.post('/timedHealthCode', async ctx => {
    const body = ctx.request.body
    debug(body)

    let start = +body.start
    const interval = +body.interval * 1000
    const client = clients[+body.botId]
    const targetMethod = targetTypeMap[body.targetType]
    const targetId = +body.targetId
    // const noticeMethod = targetTypeMap[body.noticeTargetType]
    const noticeTargetId = +body.noticeTargetId

    assert(client, 'bot 未登录')

    if (DEBUG) {
        start = Date.now() + 5000
    }

    let notice: (message: Sendable, source?: Quotable) => Promise<MessageRet>
    switch (body.noticeTargetType as TargetType) {
        case TargetType.Private:
            assert(client.hasFriend(noticeTargetId), '通知目标不是好友')
            notice = client.sendPrivateMsg.bind(client, noticeTargetId)
            break
        case TargetType.Group:
            assert(client.hasGroup(noticeTargetId), '通知目标不是已加入的群')
            notice = client.sendGroupMsg.bind(client, noticeTargetId)
            break
        default:
            throw new ExposeError('未注册的目标群体')
    }

    assert(targetMethod && targetId, '参数错误')

    switch (body.targetType as TargetType) {
        case TargetType.Private:
            assert(client.hasFriend(targetId), '目标不是好友')
            new Timer(
                () => {
                    client.sendPrivateMsg(targetId, '请发送健康码截图以供检测')

                    client.on('message.private', async e => {
                        if (
                            e.from_id === targetId &&
                            e.message.length === 1 &&
                            e.message[0].type === 'image' &&
                            !e.message[0].asface
                        ) {
                            const imageUrl = e.message[0].url
                            const data = await ocrClient.RecognizeHealthCodeOCR(
                                {
                                    ImageUrl: imageUrl,
                                }
                            )
                            debug(data)

                            const { deny, warnings } = checkHealthCode(data)
                            if (deny) {
                                client.sendPrivateMsg(targetId, deny)
                            } else if (warnings) {
                                const warning = [
                                    `ID ${targetId}`,
                                    ...warnings,
                                ].join('\n')
                                await notice(warning)
                                client.sendPrivateMsg(
                                    targetId,
                                    '健康码检测完成，异常情况已上报'
                                )
                            } else {
                                client.sendPrivateMsg(
                                    targetId,
                                    '健康码检测通过'
                                )
                            }
                        }
                    })
                },
                start,
                interval
            )
            break
        case TargetType.Group:
            throw new ExposeError('内部未实现')
            assert(client.hasGroup(noticeTargetId), '目标不是已加入的群')
            break
        default:
            throw new ExposeError('未注册的目标群体')
    }

    ctx.body = '成功'
})

router.post('/subscribe', async ctx => {
    const body = ctx.request.body
    debug(body)

    let start = +body.start
    const interval = +body.interval * 1000
    const targetId = +body.targetId
    const method = targetTypeMap[body.targetType]
    const client = clients[+body.botId]
    const provinces = body.provinces

    assert(client, 'bot 未登录')

    if (DEBUG) {
        start = Date.now() + 5000
    }

    assert(start && targetId && method && provinces, '参数错误')
    assert(start > Date.now() + 1000, '开始时间错误')

    debug(new Date(start), new Date())
    debug(start - Date.now())

    new Timer(
        async () =>
            await client[method](targetId, await getSpecifiedData(provinces)),
        start,
        interval
    )

    ctx.body = '成功'
})

router.post('/nCoVApiTest', async ctx => {
    const body = ctx.request.body
    debug(body)

    const provinces = body
    assert(provinces, '参数错误')

    ctx.body = await getSpecifiedData(provinces)
})

router.get('/serverRestart', ctx => {
    fs.writeFile('tmp.ts', '')
    ctx.status = 200
})

process.on('unhandledRejection', error => {
    debug('unhandledRejection', error)
})

process.on('uncaughtException', error => {
    debug('uncaughtException', error)
})

app.use(router.routes())

const port = process.env.PORT || 7654
app.listen(port, () => {
    debug(`server started at port ${port}`)
})
