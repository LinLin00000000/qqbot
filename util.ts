import axios from 'axios'
import { RecognizeHealthCodeOCRResponse } from 'tencentcloud-sdk-nodejs/tencentcloud/services/ocr/v20181119/ocr_models'

export const id = e => e

export const number = (e: string) => +e

export const numbers = (array: string[]) => array.map(number).filter(id)

export class ExposeError extends Error {
    expose = true
    status: number

    constructor(response: string | object, status = 400) {
        if (typeof response === 'object') {
            response = JSON.stringify(response)
        }
        super(response)
        this.status = status
    }
}

export const throwExposeError = (message: string, status?: number) => {
    throw new ExposeError(message, status)
}

export const assert = (value: any, message: string, status?: number) => {
    value || throwExposeError(message, status)
}

export class Timer {
    timer: NodeJS.Timeout

    constructor(action: () => any, start: number, interval?: number) {
        this.timer = setTimeout(() => {
            interval
                ? (action(), ((this.timer = setInterval(action, interval))))
                : action()
        }, start - Date.now())
    }

    destroy(): void {
        clearTimeout(this.timer)
    }
}

export const checkHealthCode = (
    data: RecognizeHealthCodeOCRResponse
): { deny?: string; warnings?: string[] } => {
    const warnings: string[] = []
    let deny: string

    if (!data.Time) {
        deny = '健康码应具有时间，该图片不是健康码'
        return { deny }
    }

    const time = convertTime(data.Time)
    if (Date.now() - time.getTime() > 3600000) {
        return {
            deny: `截图时间为${time.toString()}，时间过长，请重新截图`,
        }
    }

    if (data.Color !== '绿色') {
        warnings.push(`健康码颜色为${data.Color}`)
    }

    const testintTime = convertTime(data.TestingTime)
    if (testintTime) {
        if (Date.now() - testintTime.getTime() > 172800000) {
            warnings.push(
                `最近核算检测时间为${time.toString()}，已超过 48 小时`
            )
        }
    } else {
        warnings.push('无 48 小时内核酸记录')
    }

    return { deny, warnings }
}

export const groupFilterGenerator = (
    rule: string,
    array: string[]
): ((s: string) => boolean) => {
    switch (rule) {
        case 'all':
            return _ => true
        case 'include':
            return array.includes
        case 'exclude':
            return e => !array.includes(e)
        default:
            throw new ExposeError('未注册的转发规则')
    }
}

export const convertTime = (s: string) =>
    s
        ? new Date(
              `${new Date().getFullYear()}-${s
                  .replace('月', '-')
                  .replace('日', ' ')}+08:00`
          )
        : null

const provinceDelimiter = '--\n'
export const getSpecifiedData = async (specified: string[]) => {
    const { times, list } = (
        await axios.get(
            'https://interface.sina.cn/news/wap/fymap2020_data.d.json'
        )
    ).data.data

    return (
        times +
        '\n' +
        provinceDelimiter +
        list
            .filter(e => specified.includes(e.name))
            .map(e => {
                let result = e.name + '\n现存总确诊 ' + e.econNum
                if (e.city && e.econNum > 0) {
                    result +=
                        '\n\n各地区确诊\n' +
                        e.city
                            .filter(e => e.econNum > 0)
                            .sort((a, b) => b.econNum - a.econNum)
                            .map(e => `${e.name} ${e.econNum}`)
                            .join('\n')
                }
                return result
            })
            .join('\n' + provinceDelimiter) +
        [...provinceDelimiter].reverse().join('')
    )
}
