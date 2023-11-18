import { BotTelegram } from "@tg/bot/bot-telegram";
import appConfig from "@config/app-config"
import { log } from "@logger/logger"
import { AlertContainer } from "@core/alert/alert-container"
import { setupActions } from "@tg/bot/bot-utils/action"
import { setupCommands } from "@tg/bot/bot-utils/command"
import * as TgText from "@tg/bot/bot-utils/out/text"
import { TgRequestResponse } from "@definitions/definitions-tg";
import { ZendeskUsers } from "@core/ticket/zendesk-users";

const prefix = "[telegram][logics]"

const start = (alertsContainer: AlertContainer, zendeskUsers: ZendeskUsers) => {

  const botConfig = {
    token: <string>appConfig.getKey('telegram.bot_token'),
    delay: 500,
    menuButtons: [
      [{ text: "/start" }, { text: "/stop" }, { text: "/help" }],
      [{ text: "/notifications_type" }, { text: "/zendesk" }, { text: "/zendesk_work_type" }, { text: "/slack" }],
    ],
  }

  log(`${prefix} Bot configuration: { token: ${botConfig.token} delay: ${Math.floor(botConfig.delay / 100) / 10}s, menu: ${JSON.stringify(botConfig.menuButtons)}}`)
  log(`${prefix} Spawn extensions`)
  const botInstance = new BotTelegram(botConfig)

  log(`${prefix} Start listening updates in tg bot`)
  botInstance.start()

  setupActions(botInstance, alertsContainer, zendeskUsers)
  setupCommands(botInstance, alertsContainer, zendeskUsers)
  log(`${prefix} Setup listeners: { commands: [${Object.keys(botInstance.listeners.commands)}], actions: [${Object.keys(botInstance.listeners.actions)}], messages: [${Object.keys(botInstance.listeners.messages)}]}`)

  botInstance
      .setupMenu(TgText.setupMenuMessage())
      .then(() => {
        return botInstance.sendMessage(TgText.mainMessage())
      })
      .then((res: TgRequestResponse) => {
        if (!res.ok) return false

        botInstance.mainMassageId = res.result.message_id
        return true
      })
  log(`${prefix} Setup menu and hello message`)

  return botInstance
}

export default {
  start,
}