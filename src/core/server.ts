import appConfig from "@config/app-config"
import { log } from "@logger/logger"
import { slackMiddleware, getSlackHandshake, getSlackStatus } from "./slack/slack-middleware" 
import { AlertContainer } from "@core/alert/alert-container"
import { printScript } from "@lib/browser-script"
import { ZendeskUsers } from "@core/ticket/zendesk-users"
import { ZendeskTickets } from "@core/ticket/zendesk-tickets"
import { sleep } from "@lib/utils"
import express  from 'express'
import cors from 'cors'
import {Ticket} from "@core/ticket/ticket";

const prefix = "[app]"

function startExpressServer(alertContainer: AlertContainer, port: number) {
    log(`${prefix} Start express server to get notification from browser`)
    const app = express()
        .use(cors({
            origin: '*'
        }))
        .use(express.json({ limit: '50Mb' }))
    
    app.post("/api/slack", (req, res) => {slackMiddleware(req, res, alertContainer)})

    app.listen(port, () => log(`${prefix} Slack server is running on PORT: ${port}`))
}

async function startZendesk(alertContainer: AlertContainer) {
    log(`${prefix} Start zendesk part`)

    const zendeskViewUrl = <string>appConfig.getKey('zendesk.view_url')
    const zendeskUsersUrl = <string>appConfig.getKey('zendesk.view_url')
    const zendeskSession = <string>appConfig.getKey('zendesk.shared_session')

    const users = new ZendeskUsers(zendeskUsersUrl, zendeskSession)
    const tickets = new ZendeskTickets(zendeskViewUrl, zendeskSession)

    await users.fetchUsers()
    if (!users.length) {
        log(`${prefix} Error parse users. Second try after 10 seconds`)
        console.log("Error parse users from zendesk. Second try after 10 seconds. Look details on log file")
        await sleep(10000)
        await users.fetchUsers()
    }

    tickets.setUsers(users.listUsersId)

    tickets.startAlert((inpTickets: Ticket[], resolvedTickets: number[]) => {
        alertContainer.addTickets(inpTickets)
        tickets.clearUnAckTickets()

        alertContainer.clearResolvedTickets(resolvedTickets)
        tickets.clearResolvedTickets()

        tickets.startFetching()
    })
}

export function start(alertContainer: AlertContainer) {
    const serverPort = <number>appConfig.getKey('server_port')
    
    startExpressServer(alertContainer, serverPort)
    printScript(<string>appConfig.getKey('slack.ws_link'), serverPort)
    startZendesk(alertContainer).then(() => log(`${prefix} Fetch started success`))

    setTimeout(() => {
        console.log(getSlackHandshake())
        console.log(getSlackStatus())
    }, 10000)
}

export function stop() {
    log(`${prefix} Stop application`)


}