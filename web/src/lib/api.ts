export const HOST = '127.0.0.1'
export const PORT = '7654'
export const QQ_SERVER_HOST = HOST + ':' + PORT

export const WSApiQrcodeLogin = `ws://${QQ_SERVER_HOST}/qrcodeLogin`

export const ApiTimedMessage = `http://${QQ_SERVER_HOST}/timedMessage`
export const ApiMessageForward = `http://${QQ_SERVER_HOST}/messageForward`
export const ApiTimedHealthCode = `http://${QQ_SERVER_HOST}/timedHealthCode`
export const ApiSubscribe = `http://${QQ_SERVER_HOST}/subscribe`
export const ApiGetBots = `http://${QQ_SERVER_HOST}/bots`
export const ApiBotLogout = `http://${QQ_SERVER_HOST}/botLogout`
export const ApiServerRestart = `http://${QQ_SERVER_HOST}/serverRestart`
