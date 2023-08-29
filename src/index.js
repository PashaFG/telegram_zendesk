// @ts-nocheck

import appConfig from '#core/config/app_config.js'
import { AlertList } from '#core/alert/alert_list.js'
import regexp from './utils/regexp.js'
import bot from '#inp_out/tg/bot.js'
import server from '#inp_out/server.js'

appConfig.readConfig('./app_config.json')

const alertsContainer = new AlertList()
const telegramBot = bot.start()
server.start(alertsContainer, telegramBot)

setInterval(() => {
  console.log(`ChatID = ${telegramBot.chatId}`)
  alertsContainer.items.forEach(element => {
    if (!element.tgMessageId) {
      if (element.type === "ticket") {
        const message_text = `${(element.isEmergency) ? '⚠️Emergency⚠️\n' : ''}#${element.body.id}`

        const message = telegramBot.sendMessage(`new alert: ${JSON.stringify(element.type).replaceAll(regexp.formattingRegExp, '\\$1')}`)

        message.then((response) => {
          element.tgMessageId = response.result.message_id
          console.log(response.result.message_id)
        })
      } else if (element.type === "slack") {

      }
    }
    console.log(`${element.body.id} - ${element.tgMessageId}`)
  });
  console.log(`TO ALERT: ${alertsContainer.length}`)
}, 1000 * 10)