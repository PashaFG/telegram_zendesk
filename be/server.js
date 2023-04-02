import tickets from "./tickets.js";
import { alertingOn, sendMessage } from "../tg/bot.js"
import { callUsers } from "../call/apiVatsITL.js"
import browserScript from "../browserScript.js"

import express from "express";
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config()

browserScript.writeInstruction()

const PORT = process.env.SERVER_PORT

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
  if (alertingOn) {
    // Отправка сообщений, если подписка на сообщения была включена
    if (message?.tickets) {
      message.tickets.forEach((ticket) => {
        // Формирования текста оповещения
        let text = `${ticket.id} ${ticket.subject}`
        if (ticket.priority) { text += `\nПриоритет: ${ticket.priority}` }
        if (ticket.sla) { text += `\nSLA: ${ticket.sla}` }

        // Формирования кнопки для перехода к тикету
        let body = {
          reply_markup: {
            inline_keyboard: [[{ text: `Перейти к тикету: #${ticket.id}`, url: ticket.link },]]
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
    if (unAckTickets[i].alertTime < Date.now()) {
      // Совершение вызова и откладывание вызова по данному тикету, еще на N минут, указанных в конфиге
      unAckTickets[i].alertTime += Number(process.env.ALERT_TIME)
      callUsers()
      break
    }
  }
});

app.listen(PORT, () => console.log(`Ticket server is running on PORT: ${PORT}`));