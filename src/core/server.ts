import express from 'express'
import cors from 'cors'
import appConfig from "@config/app-config"
import { log } from "@logger/logger"
import { BotTelegram } from "@tg/bot/bot-telegram"
import { AlertContainer } from "@core/alert/alert-container"
import { slackMiddleware, getSlackHandshake, getSlackStatus } from "@core/slack/slack-middleware"
import { ZendeskUsers } from "@core/ticket/zendesk-users"
import { ZendeskTickets } from "@core/ticket/zendesk-tickets"
import { Ticket } from "@core/ticket/ticket"
import * as VatsApi from "@core/vats/vats-api"
import { VoidFunction } from "@definitions/common";
import * as TgText from "@tg/bot/bot-utils/out/text"
import * as TgKeyboard from "@tg/bot/bot-utils/out/inline-keyboards"
import { SlackEvent } from "@core/slack/slack";
import {PushType} from "@definitions/definitions-config";
import {callUser} from "@core/vats/vats-api";

const prefix = "[app]"
let isSlackServerStarted: boolean = false
let ticketsIntervalId: null | NodeJS.Timeout = null
let isNeedToCheckSlackEvents: boolean = false
let callIntervalId: null | NodeJS.Timeout = null

function startExpressServer(alertContainer: AlertContainer, port: number, slackPingPongSendMessage: VoidFunction, bot: BotTelegram) {
    isSlackServerStarted = true
    log(`${prefix} Start express server to get notification from browser`)
    const app = express()
        .use(cors({
            origin: '*',
        }))
        .use(express.json({ limit: '50Mb' }))

    app.post("/api/slack", (req, res) => {
        const slackAlert = (slackEvent: SlackEvent) => {
            bot.sendMessage(TgText.slackMessage(slackEvent), TgKeyboard.slackKeyboard()).then((response) => {
                alertContainer.addSlackEvent(slackEvent, response.result.message_id)
            })
        }

        slackMiddleware(req, res, alertContainer, isNeedToCheckSlackEvents, slackPingPongSendMessage, slackAlert)
    })

    app.listen(port, () => log(`${prefix} Slack server is running on PORT: ${port}`))
}

async function startZendesk(alertContainer: AlertContainer, zendeskUsers: ZendeskUsers, tickets: ZendeskTickets, bot: BotTelegram) {
    log(`${prefix} Start zendesk part`)
    tickets.setUsers(zendeskUsers.listUsersId)

    tickets.startAlert((inpTickets: Ticket[], resolvedTickets: number[]) => {
        inpTickets.forEach((ticket) => {
            bot.sendMessage(TgText.ticketMessage(ticket), TgKeyboard.ticketKeyboard(ticket))
                .then((res) => { alertContainer.addTicket(ticket, res.result.message_id) })
        })
        tickets.clearUnAckTickets()

        alertContainer.clearResolvedTickets(resolvedTickets)
        tickets.clearResolvedTickets()
    })

    ticketsIntervalId = await tickets.startFetching()
}

function startCall(alertContainer: AlertContainer) {
    log(`${prefix} Start call control service`)
    callIntervalId = setInterval(() => {
        const needCallNow =  alertContainer.needAlertCall
        log(`${prefix} Is need to call? - ${needCallNow}`)

        if (needCallNow) {
            log(`${prefix} Start calling user`)

            callUser()
        }

    }, 10000)
}

export function start(alertContainer: AlertContainer, bot: BotTelegram, zendeskUsers: ZendeskUsers, tickets: ZendeskTickets, slackPingPongSendMessage: VoidFunction) {
    const serverPort = <number>appConfig.getKey('server_port')
    const needCall = <PushType>appConfig.getKey('alert.type') === PushType.Call
    
    if(!isSlackServerStarted) startExpressServer(alertContainer, serverPort, slackPingPongSendMessage, bot)
    isNeedToCheckSlackEvents = true
    startZendesk(alertContainer, zendeskUsers, tickets, bot).then(() => log(`${prefix} Fetch started`))
    VatsApi.setupUser().then(() => {
        log(`${prefix} Setup user in Vats`)
    })

    if(!callIntervalId && needCall) startCall(alertContainer)
}

export function stop(alertContainer: AlertContainer) {
    log(`${prefix} Stop application`)

    if(ticketsIntervalId) {
        log(`${prefix} Stop tickets requests`)
        clearInterval(ticketsIntervalId)
        ticketsIntervalId = null
    }

    log(`${prefix} Clear all alerts`)
    alertContainer.clearAllAlerts()

    log(`${prefix} Stop checking events from Slack`)
    isNeedToCheckSlackEvents = false

    if (callIntervalId) {
        log(`${prefix} Stop call control service`)
        clearInterval(callIntervalId)
        callIntervalId = null
    }

    VatsApi.clearUser().then(() => {
        console.log(`${prefix} Clear user in Vats`)
    })
}