import { Request, Response } from 'express'
import { log } from "@logger/logger"
import { AlertContainer } from '@core/alert/alert-container'
import { SlackEvent } from './slack'
import { VoidFunction } from "@definitions/common";

const prefix = "[slack][middleware]"

let lastPingId: number
let lastPongId: number
let lastSuccessPingPongSession: number
let intervalId: NodeJS.Timeout

export function getSlackHandshake() {
    if (lastPingId && lastPongId) {
        log(`${prefix} Request to status setup. The initial handshake was successful`)
        return true
    }

    log(`${prefix} Request to status setup. The handshake did not take place`)
    return false
}

export function getSlackStatus() {
    const delay = Date.now() - lastSuccessPingPongSession
    log(`${prefix} Request to status connection. Last success ping-pong: ${delay} ms age`)
    return delay
}

function setId(id: NodeJS.Timeout) {
    intervalId = id
}

function clearId() {
    clearTimeout(intervalId)
}

function getPing(id: number, slackPingPongSendMessage: VoidFunction): NodeJS.Timeout {
    log(`${prefix} ping-${id}`)
    
    if (!lastPingId) { log(`${prefix} browser script in slack has been started`) }
    
    lastPingId = id
    if (intervalId) { clearId() }

    return setTimeout(() => {
        log(`${prefix} Pong is not be received. Check browser page and restart script`)
        slackPingPongSendMessage()
    }, 60000) // 1 минута указана, на случай каких-либо затупов браузера/сети
}

function getPong(id: number, slackPingPongSendMessage: VoidFunction): NodeJS.Timeout {
    log(`${prefix} pong-${id}`)
    if (!lastPongId) { log(`${prefix} Browser can connected to Slack`) }
    
    lastPongId = id
    if (intervalId && lastPingId === id) {
        clearId()
        lastSuccessPingPongSession = Date.now()
    }

    return setTimeout(() => {
        log(`${prefix} Ping is not be received.`)
        slackPingPongSendMessage()
    }, 60000) // 1 минута указана, на случай каких-либо затупов браузера/сети
}

export function slackMiddleware(
    req: Request,
    res: Response,
    alertContainer: AlertContainer,
    isNeedToCheck: boolean,
    slackPingPongSendMessage: VoidFunction,
    slackAlert
) {
    if (!isNeedToCheck) {
        res.sendStatus(200)
        return
    }

    let timeoutId: NodeJS.Timeout
    switch (req.body.type) {
        case "ping":
            timeoutId = getPing(req.body.id, slackPingPongSendMessage)
            setId(timeoutId)
            break
        
        case "pong":
            timeoutId = getPong(req.body.reply_to, slackPingPongSendMessage)
            setId(timeoutId)
            break
        
        case "desktop_notification":
            slackAlert(new SlackEvent(req.body))
            break
        
        default:
            log(`${prefix} Not exist event type: ${req.body.type}`)
    }

    res.sendStatus(200)
}