import tickets from "./tickets.js";
import slack from "./slack.js";
import { getAlertingStatus, sendMessage } from "../tg/bot.js"
import { callUsers } from "../call/apiVats.js"
import browserScript from "../browserScript.js"
import { logger, logCleaner } from "./logger.js"

import express from "express";
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config()

browserScript.writeInstruction()
setInterval(logCleaner, 1000)
setInterval(checkToSlackCall, 10000)

const PORT = process.env.SERVER_PORT

function checkToSlackCall() {
  // Функция проверки необходимости звонка сотруднику
  try {
    const alertTime = Number(slack.getSlackNotification())
    // Выход из функции без доп проверок, если выключена нотификация, или отсуствуют неподтверждённые оповещения
    if (alertTime === 0 || !getAlertingStatus()) { return }
    const timeNow = Number(Date.now())
    if (alertTime < timeNow) {
      logger.log({ level: 'info', label: 'server', subLabel: 'checkToSlackCall', message: 'Slack Notification call', })
      callUsers()
      slack.setSlackNotification(Date.now() + Number(process.env.ALERT_TIME_EMERGENCY))
    } else {
      logger.log({ level: 'info', label: 'server', subLabel: 'checkToSlackCall', message: `Time to Slack Notification call is ${(alertTime - timeNow) / 1000}s`, })
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'server', message: `${String(e)}`, })
  }
}

const app = express();
// app.use(express.json());
app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '50Mb' }));

app.post("/api/tickets", (req, res) => {
  // Получения списка актуальных тикетов
  try {
    let inputText = req.body.text
    logger.log({ level: 'info', label: 'server', message: `Receipt request on endpoint: "/api/tickets"`, })
    // logger.log({ level: 'info', label: 'server', message: `Request body:  ${JSON.stringify(req.body)}`, })
    res.send("OK")
    // Преобразование тикетов в необходимый формат
    logger.log({ level: 'info', label: 'server', message: `Math tickets to "tickets"`, })
    let ticketsNew = tickets.matchTickets(inputText)
    logger.log({ level: 'info', label: 'server', message: `Get tickets from "tickets" and save: ${ticketsNew.length}`, })
    tickets.saveTickets(ticketsNew)
    let message = tickets.checkDiffTickets()
    logger.log({ level: 'info', label: 'server', message: `Get tickets difference result: ${JSON.stringify(message)}`, })
    if (getAlertingStatus()) {
      logger.log({ level: 'info', label: 'server', message: `Receipt alert status: ${getAlertingStatus()}`, })
      // Отправка сообщений, если подписка на сообщения была включена
      if (message?.tickets) {
        message.tickets.forEach((ticket) => {
          // Формирование текста оповещения
          let text = `#${ticket.id} ${ticket.subject}`
          if (ticket.priority) { text += `\nПриоритет: ${ticket.priority}` }
          if (ticket.sla) { text += `\nSLA: ${Math.floor((Date.parse(ticket.sla) - Date.now()) / 60000)} min` }

          // Формирование кнопки для перехода к тикету
          let body = {
            reply_markup: {
              inline_keyboard: [[
                { text: `Перейти к тикету: #${ticket.id}`, url: ticket.link },
                { text: `ack: #${ticket.id}`, callback_data: 'ack' },
              ]]
            }
          }

          logger.log({ level: 'info', label: 'server', message: `A message has been generated: Text:${text}; Body: ${JSON.stringify(body)}`, })
          sendMessage(text, body)
        })
      }
    }

    // Проверка необходимости оповещения с помощью звонка по телефону
    let unAckTickets = tickets.getUnAckedTicket()
    logger.log({ level: 'info', label: 'server', message: `Get tickets without ack: ${JSON.stringify(unAckTickets)}`, })
    for (let i = 0; i < unAckTickets.length; i++) {
      if (unAckTickets[i].alertTime < Date.now() && getAlertingStatus()) {
        logger.log({ level: 'info', label: 'server', message: `Time to call for ticket: ${unAckTickets[i].ticket.id}`, })
        // Совершение вызова и откладывание вызова по данному тикету, еще на N минут, указанных в конфиге
        unAckTickets[i].alertTime += Number(process.env.ALERT_TIME)
        callUsers()
        break
      }
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'server', message: `${String(e)}`, })
  }
});

app.post("/api/slack", (req, res) => {
  // Получение нотификации от slack
  try {
    logger.log({ level: 'info', label: 'server', message: `Receipt request on endpoint: "/api/slack"`, })
    // logger.log({ level: 'info', label: 'server', message: `Request body:  ${req.body}`, })
    res.send("OK")
    if (getAlertingStatus()) {
      logger.log({ level: 'info', label: 'server', message: `Receipt alert status: ${getAlertingStatus()}`, })
      let rawMessage = req.body
      // Проверка на "Важность" данной нотификации
      let notification = slack.checkMessage(rawMessage)
      let body = {
        reply_markup: {
          inline_keyboard: [[
            { text: `ack slack notification`, callback_data: 'ackSlack' },
          ]]
        }
      }
      // @ts-ignore
      logger.log({ level: 'info', label: 'server', message: `A message has been generated: Text:${notification.message}; Body: ${JSON.stringify(body)}`, })
      // @ts-ignore
      sendMessage(notification.message, body)

      // @ts-ignore
      if (notification.type === "emergency") {
        const newTime = Date.now() + Number(process.env.ALERT_TIME_EMERGENCY)
        logger.log({ level: 'info', label: 'server', message: `Emergency notification type, next call has been: ${new Date(newTime)}`, })
        slack.setSlackNotification(newTime)
      } else {
        const newTime = Date.now() + Number(process.env.ALERT_TIME)
        logger.log({ level: 'info', label: 'server', message: `Next call has been: ${new Date(newTime)}`, })
        slack.setSlackNotification(Date.now() + Number(process.env.ALERT_TIME))
      }
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'server', message: `${String(e)}`, })
  }
})

app.listen(PORT, () => logger.log({ level: 'info', label: 'server', message: `Ticket server is running on PORT: ${PORT}`, }))
