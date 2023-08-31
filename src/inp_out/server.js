// @ts-nocheck
import appConfig from '#core/config/app_config.js'
import { logger } from "#utils/logger/logger.js";
import { ZendeskTickets } from '#inp_out/ticket/zendesk_tickets.js'
import { ZendeskUsers } from '#inp_out/ticket/zendesk_users.js'
import { SlackEvent } from '#inp_out/slack/slack_event.js';
import express from "express";
import cors from 'cors'

const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '50Mb' }));

const start = (AlertList, telegramBot) => {
  const zendeskViewUrl = appConfig.getKey('zendesk.view_url')
  const zendeskDomain = appConfig.getKey('zendesk.domain') || (zendeskViewUrl) ? zendeskViewUrl.match(/\w+\.zendesk.com/gm)[0] : false || undefined
  const zendeskUsersUrl = `https://${zendeskDomain}/api/v2/users?organization_id=${appConfig.getKey('zendesk.organization_id')}&default_group_id=${appConfig.getKey('zendesk.default_group_id')}`
  const zendeskSession = appConfig.getKey('zendesk.shared_session')

  const users = new ZendeskUsers(zendeskUsersUrl, zendeskSession)
  const tickets = new ZendeskTickets(zendeskViewUrl, zendeskSession)

  users.fetchUsers()
    .then(() => {

      tickets.startAlert((unAckTickets, resolvedTicketsId) => {
        AlertList.addTickets(unAckTickets)
        tickets.clearUnAckTickets()

        AlertList.clearResolvedTickets(resolvedTicketsId)
        tickets.clearResolvedTickets()
      })

      tickets.startFetching(1000 * 60, users.users)
    })

  app.post("/api/slack", (req, res) => {
    AlertList.addSlackEvent(new SlackEvent(req.body))
    res.status(200).send('OK')
  })

  const PORT = appConfig.getKey('server_port')

  app.listen(PORT, () => logger.log({ level: 'info', label: 'Server', message: `Slack server is running on PORT: ${PORT}`, }))
}

export default {
  start
}