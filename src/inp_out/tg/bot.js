// @ts-nocheck
import { BotTelegram } from "./bot/index.js";
import appConfig from '#core/config/app_config.js'
import messages from './bot/examples/messages_example.js'
import keyboards from './bot/examples/keybords_example.js'

const start = () => {

  const botConfig = {
    token: appConfig.getKey('bot_token'),
    delay: 1000,
    menuButtons: [
      [{ text: "/start" }, { text: "/stop" }, { text: "/help" },],
      [{ text: "/smth1" }, { text: "/smth2" },]
    ]
  }

  return new BotTelegram(botConfig)
}

export default {
  start
}