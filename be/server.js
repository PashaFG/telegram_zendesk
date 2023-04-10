import tickets from "./tickets.js";
import slack from "./slack.js";
import { getAlertingStatus, sendMessage } from "../tg/bot.js"
import { callUsers } from "../call/apiVats.js"
import browserScript from "../browserScript.js"

import express from "express";
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config()

browserScript.writeInstruction()

const PORT = process.env.SERVER_PORT

function checkToSlackCall() {
  // Функция проверки необходимости звонка сотруднику
  const alertTime = Number(slack.getSlackNotification())
  // Выход из функции без доп проверок, если выключена нотификация, или отсуствуют неподтверждённые оповещения
  if (alertTime === 0 || !getAlertingStatus()) { return }
  const timeNow = Number(Date.now())
  if (alertTime < timeNow) {
    console.log('Slack Notification call')
    callUsers()
    slack.setSlackNotification(Date.now() + Number(process.env.ALERT_TIME_EMERGENCY))
  } else {
    console.log(`Time to Slack Notification call is ${(alertTime - timeNow) / 1000}s`)
  }
}


const app = express();
app.use(express.json());
app.use(cors({
  origin: '*'
}));

app.post("/api/tickets", (req, res) => {
  // Получения списка актуальных тикетов
  let inputText = req.body.text
  res.send("OK")
  // Преобразование тикетов в необходимый формат
  let ticketsNew = tickets.matchTickets(inputText)
  tickets.saveTickets(ticketsNew)
  let message = tickets.checkDiffTickets()
  if (getAlertingStatus()) {
    // Отправка сообщений, если подписка на сообщения была включена
    if (message?.tickets) {
      message.tickets.forEach((ticket) => {
        // Формирование текста оповещения
        let text = `#${ticket.id} ${ticket.subject}`
        if (ticket.priority) { text += `\nПриоритет: ${ticket.priority}` }
        if (ticket.sla) { text += `\nSLA: ${ticket.sla}` }

        // Формирование кнопки для перехода к тикету
        let body = {
          reply_markup: {
            inline_keyboard: [[
              { text: `Перейти к тикету: #${ticket.id}`, url: ticket.link },
              { text: `ack: #${ticket.id}`, callback_data: 'ack' },
            ]]
          }
        }

        sendMessage(text, body)
      })
    }
  }

  // Проверка необходимости оповещения с помощью звонка по телефону
  let unAckTickets = tickets.getUnAckedTicket()
  for (let i = 0; i < unAckTickets.length; i++) {
    console.log(unAckTickets[i].alertTime);
    console.log(Date.now());
    if (unAckTickets[i].alertTime < Date.now() && getAlertingStatus()) {
      // Совершение вызова и откладывание вызова по данному тикету, еще на N минут, указанных в конфиге
      unAckTickets[i].alertTime += Number(process.env.ALERT_TIME)
      callUsers()
      break
    }
  }
});

app.post("/api/slack", (req, res) => {
  // получение нотификации от slack
  res.send("OK")
  if (getAlertingStatus()) {
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
    sendMessage(notification.message, body)

    if (notification.type === "emergency") {
      slack.setSlackNotification(Date.now() + Number(process.env.ALERT_TIME_EMERGENCY))
    } else {
      slack.setSlackNotification(Date.now() + Number(process.env.ALERT_TIME))
    }
  }
})

app.listen(PORT, () => console.log(`Ticket server is running on PORT: ${PORT}`));
setInterval(checkToSlackCall, 10000)