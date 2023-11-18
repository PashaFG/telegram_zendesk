import appConfig from "@config/app-config"
import { log } from "@logger/logger"
import { slackMiddleware, getSlackHandshake, getSlackStatus } from "./slack/slack-middleware" 
import { AlertContainer } from "@core/alert/alert-container"
import { ZendeskUsers } from "@core/ticket/zendesk-users"
import { ZendeskTickets } from "@core/ticket/zendesk-tickets"
import express from 'express'
import cors from 'cors'
import { Ticket } from "@core/ticket/ticket";
import { BotTelegram } from "@tg/bot/bot-telegram";

const prefix = "[app]"
let isSlackServerStarted: boolean = false
let ticketsIntervalId: null | NodeJS.Timeout = null
let isNeedToCheckSlackEvents: boolean = false

function startExpressServer(alertContainer: AlertContainer, port: number) {
    isSlackServerStarted = true
    log(`${prefix} Start express server to get notification from browser`)
    const app = express()
        .use(cors({
            origin: '*',
        }))
        .use(express.json({ limit: '50Mb' }))

    app.post("/api/slack", (req, res) => {
        slackMiddleware(req, res, alertContainer, isNeedToCheckSlackEvents)
    })

    app.listen(port, () => log(`${prefix} Slack server is running on PORT: ${port}`))
}

async function startZendesk(alertContainer: AlertContainer, zendeskUsers: ZendeskUsers) {
    log(`${prefix} Start zendesk part`)

    const zendeskViewUrl = <string>appConfig.getKey('zendesk.view_url')
    const zendeskSession = <string>appConfig.getKey('zendesk.shared_session')

    const tickets = new ZendeskTickets(zendeskViewUrl, zendeskSession)

    tickets.setUsers(zendeskUsers.listUsersId)

    tickets.startAlert((inpTickets: Ticket[], resolvedTickets: number[]) => {
        alertContainer.addTickets(inpTickets)
        tickets.clearUnAckTickets()

        alertContainer.clearResolvedTickets(resolvedTickets)
        tickets.clearResolvedTickets()
    })

    ticketsIntervalId = await tickets.startFetching()
}

export function start(alertContainer: AlertContainer, bot: BotTelegram, zendeskUsers: ZendeskUsers) {
    const serverPort = <number>appConfig.getKey('server_port')
    
    if(!isSlackServerStarted) startExpressServer(alertContainer, serverPort)
    isNeedToCheckSlackEvents = true
    startZendesk(alertContainer, zendeskUsers).then(() => log(`${prefix} Fetch started`))

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
}