import { Telegraf } from 'telegraf';
import { setupUser, clearUser } from '../call/apiVats.js'
import tickets from '../be/tickets.js';
import slack from '../be/slack.js'
import dotenv from 'dotenv';
dotenv.config()


const tokenBot = process.env.BOT_TOKEN
// В данную переменную перезаписывается информация об источники сообщений в сторону бота, именно в этот диалог и будут отправляться ответы и оповещения
let inputMessage
let alertingOn = false

function sendMessage(text, buttons) {
  if (!buttons) {
    inputMessage.reply(text);
  } else {
    inputMessage.reply(text, buttons)
  }
}


const bot = new Telegraf(String(tokenBot));


bot.command('stop', (ctx) => {
  // Остановка отправки оповещений, очистка переадресации у сотрудника
  alertingOn = false
  clearUser()
  console.log(`Статус отправки сообщений: ${alertingOn}`);
  sendMessage(`Оповещения отключены.\nНомер для сотрудника отключен, переадресация отключена`)
})

bot.command('start', (ctx) => {
  // Включение оповещений, настройка сотрудника для звонков
  inputMessage = ctx
  alertingOn = true
  setupUser()
  console.log(`Статус отправки сообщений: ${alertingOn}`);
  sendMessage(`Оповещения включены.\nДля сотрудника ${process.env.VATS_USER} был назначен номер для оповещений ${process.env.VATS_TELNUM}`)
});

bot.command('ack', (ctx) => {
  // "Подтверждение" оповещения о тикете.
  let ticket_id = Number(ctx.update.message.text.replace('/ack ', ''))
  console.log(ticket_id);
  tickets.ackTicket(ticket_id)
});

bot.command('slack', (ctx) => {
  // "Подтверждение" оповещения об уведомлении в слаке.
  slack.ackSlackNotification()
  console.log('Stop alerting on slack push notification')
  sendMessage('Все предыдущие оповещения были помечены, звонки по ним отключены')
});

bot.launch();

console.log('Bot is starting');
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

function getAlertingStatus() {
  return alertingOn
}

function getInputMessage() {
  return inputMessage
}

export {
  getInputMessage,
  getAlertingStatus,
  sendMessage
}