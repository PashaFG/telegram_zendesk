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

const prefix = "[app]"
let isSlackServerStarted: boolean = false
let ticketsIntervalId: null | NodeJS.Timeout = null
let isNeedToCheckSlackEvents: boolean = false

function startExpressServer(alertContainer: AlertContainer, port: number, slackPingPongSendMessage: VoidFunction) {
    isSlackServerStarted = true
    log(`${prefix} Start express server to get notification from browser`)
    const app = express()
        .use(cors({
            origin: '*',
        }))
        .use(express.json({ limit: '50Mb' }))

    app.post("/api/slack", (req, res) => {
        slackMiddleware(req, res, alertContainer, isNeedToCheckSlackEvents, slackPingPongSendMessage)
    })

    app.listen(port, () => log(`${prefix} Slack server is running on PORT: ${port}`))
}

async function startZendesk(alertContainer: AlertContainer, zendeskUsers: ZendeskUsers, tickets: ZendeskTickets) {
    log(`${prefix} Start zendesk part`)
    tickets.setUsers(zendeskUsers.listUsersId)

    tickets.startAlert((inpTickets: Ticket[], resolvedTickets: number[]) => {
        alertContainer.addTickets(inpTickets)
        tickets.clearUnAckTickets()

        alertContainer.clearResolvedTickets(resolvedTickets)
        tickets.clearResolvedTickets()
    })

    ticketsIntervalId = await tickets.startFetching()
}

export function start(alertContainer: AlertContainer, bot: BotTelegram, zendeskUsers: ZendeskUsers, tickets: ZendeskTickets, slackPingPongSendMessage: VoidFunction) {
    const serverPort = <number>appConfig.getKey('server_port')
    
    if(!isSlackServerStarted) startExpressServer(alertContainer, serverPort, slackPingPongSendMessage)
    isNeedToCheckSlackEvents = true
    startZendesk(alertContainer, zendeskUsers, tickets).then(() => log(`${prefix} Fetch started`))
    VatsApi.setupUser().then(() => {
        log(`${prefix} Setup user in Vats`)
    })

    setTimeout(() => {
        console.log("-----SLACK----")
        console.log(getSlackHandshake())
        console.log(getSlackStatus())
        console.log("-----SLACK----")
    }, 10000)
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

    VatsApi.clearUser().then(() => {
        console.log(`${prefix} Clear user in Vats`)
    })
}