import { BotTelegram } from "@tg/bot/bot-telegram";
import appConfig from "@config/app-config"
import { log } from "@logger/logger"
import { AlertContainer } from "@core/alert/alert-container";
// import { setupActions } from "#inp_out/tg/bot/bot_utils/action.js"
// import { setupCommands } from "#inp_out/tg/bot/bot_utils/command.js"

const prefix = "[telegram][logics]"

const start = (alertsContainer: AlertContainer) => {

  const botConfig = {
    token: <string>appConfig.getKey('bot_token'),
    delay: 1000,
    menuButtons: [
      [{ text: "/start" }, { text: "/stop" },],
      [{ text: "/notifications_type" }, { text: "/zendesk_work_type" }, { text: "/help" },]
    ]
  }

  log(`${prefix} Bot configuration: { token: ${botConfig.token} delay: ${Math.floor(botConfig.delay / 100)}s, menu: ${JSON.stringify(botConfig.menuButtons)}}`)
  log(`${prefix} Spawn extensions`)
  const botInstance = new BotTelegram(botConfig)

  log(`${prefix} Start listenings updates in tg bot`)
  botInstance.start()

  log(`${prefix} Setup listeners: { commands: [${Object.keys(botInstance.listeners.commands)}], actions: [${Object.keys(botInstance.listeners.actions)}], messages: [${Object.keys(botInstance.listeners.messages)}]`)

  botInstance.setupMenu('👀 Принял смену\\! 👀\nМожешь заниматься своими делами, я присмотрю 💻\\.')
  log(`${prefix} Setup menu and hello message`)

  return botInstance
}

export default {
  start
}