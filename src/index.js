// @ts-nocheck

import regexp from '#utils/regexp.js'
import { logger } from "#utils/logger/logger.js";
import appConfig from '#core/config/app_config.js'
import { AlertList } from '#core/alert/alert_list.js'
import bot from '#inp_out/tg/bot.js'
import server from '#inp_out/server.js'

logger.log({ level: 'info', label: 'Main', message: `Start server. Read config`, })
appConfig.readConfig('./app_config.json')

logger.log({ level: 'info', label: 'Main', message: `Create container for alerts`, })
const alertsContainer = new AlertList()
logger.log({ level: 'info', label: 'Main', message: `Create bot extensions`, })
const telegramBot = bot.start()
logger.log({ level: 'info', label: 'Main', message: `All prepare finished. Start inp_out server`, })
server.start(alertsContainer, telegramBot)

setInterval(() => {
  alertsContainer.items.forEach(element => {

    if (!element.tgMessageId) {
      logger.log({ level: 'info', label: 'Main', subLabel: 'alerting', message: `Send notification for event: ${element.body.id}`, })

      let message_text = (element.isEmergency) ? '⚠️Emergency⚠️\n' : ''

      if (element.type === "ticket") {
        const body = element.body
        /** TODO переделать отправку
         * [1] добавлять SLA только при его наличии
         * [2] сделать красивее (жирный, курсив и т.д.)
         */
        message_text += `New Ticket: #${body.id} - ${body.subject}\n${body.status} SLA: ${body.sla}сек (${body.priority})`

        const message = telegramBot.sendMessage(message_text.replaceAll(regexp.formattingRegExp, '\\$1'))
        message.then((response) => {
          element.tgMessageId = response.result.message_id

          logger.log({ level: 'info', label: 'Main', subLabel: 'alerting', message: `Received message ID: ${response.result.message_id}`, })
          logger.log({ level: 'info', label: 'Main', subLabel: 'alerting', message: `New message ID in event ${element.body.id}: ${element.tgMessageId}`, })
        })

      } else if (element.type === "slack") {

      }
    }
  });
}, 1000 * 10)