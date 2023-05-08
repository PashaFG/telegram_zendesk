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

bot.help((ctx) => {
  console.log(`[BOT] insert command '/help'`)
  inputMessage = ctx
  console.log(`[BOT] send instruction`)
  const comьands = [
    "/start - Настраивает сотрудника в ВАТС, включает сервис получения обращений, включает оповещения о событиях и последующие звонки",
    "/stop - Удаляет настройку сотрудника в ВАТС, отключает получение обращений и оповещения о событиях",
    "/ack 000000 - Подтверждает обращение номер 000000 и отменяет последующий звонок по нему",
    "/slack - Подтверждает ВСЕ полученные сообщения от SLACK и отключает оповещения по ним",
    "/getUnackedTickets - возвращает список тикетов, находящихся без подтверждения",
  ]
  sendMessage(comьands.join('\n'))
})

bot.command('stop', (ctx) => {
  // Остановка отправки оповещений, очистка переадресации у сотрудника
  console.log(`[BOT] insert command '/stop'`)
  alertingOn = false
  clearUser()
  console.log(`[BOT][stop] Статус отправки сообщений: ${alertingOn}`);
  sendMessage(`Оповещения отключены.\nНомер для сотрудника отключен, переадресация отключена`)
  let intervalId = tickets.getTicketIntervalId()
  if (intervalId) {
    tickets.clearTicketIntervalID()
    console.log(`[BOT][stop] Fetch ticket have intrevalId: ${intervalId}, now it\`s clearing: ${tickets.getTicketIntervalId()}`)
  } else {
    console.log(`[BOT][stop] Fetch ticket have not intrevalId: ${intervalId}, nothing to clear`)
  }
})

bot.command('start', (ctx) => {
  // Включение оповещений, настройка сотрудника для звонков
  console.log(`[BOT] insert command '/start'`)
  inputMessage = ctx
  alertingOn = true
  setupUser()
  console.log(`[BOT][start] Статус отправки сообщений: ${alertingOn}`);
  sendMessage(`Оповещения включены.\nДля сотрудника ${process.env.VATS_USER} был назначен номер для оповещений ${process.env.VATS_TELNUM}`)
  let intervalId = tickets.getTicketIntervalId()
  if (intervalId) {
    // let intervalId = 
    tickets.setTicketIntervalId(setInterval(tickets.fetchTicket, 60000))
    console.log(`[BOT][start] Fetch ticket have intrevalId: ${intervalId}, now it\`s set to: ${tickets.getTicketIntervalId()}`)
  } else {
    tickets.setTicketIntervalId(setInterval(tickets.fetchTicket, 60000))
    console.log(`[BOT][start] Fetch ticket have not intrevalId: ${intervalId}, now it\`s set to: ${tickets.getTicketIntervalId()}`)
  }

});

bot.command('ack', (ctx) => {
  // "Подтверждение" оповещения о тикете.
  let ticket_id = Number(ctx.update.message.text.replace('/ack ', ''))
  tickets.ackTicket(ticket_id)
  ctx.reply(`Ack the ticket: ${ticket_id}\nCount unacked tickets: ${tickets.getUnAckedTicket().length}`)
});

bot.command('slack', (ctx) => {
  // "Подтверждение" оповещения об уведомлении в слаке.
  slack.ackSlackNotification()
  console.log('Stop alerting on slack push notification')
  sendMessage('Все предыдущие оповещения были помечены, звонки по ним отключены')
});

bot.command('getUnackedTickets', (ctx) => {
  inputMessage = ctx
  const unacked = tickets.getUnAckedTicket()
  if (unacked.length > 0) {
    let string = ''
    unacked.forEach((ticket) => {
      string += `#${ticket.ticket.id} - ${(ticket.ticket.sla) ? String(Math.floor((Date.parse(ticket.ticket.sla) - Date.now()) / 60000)) + "min" : "not SLA"}; Time to alert call: ${Math.floor((Date.now() - ticket.alertTime) / 60000)} min\n`
    })
    sendMessage(string)
  } else {
    sendMessage("Тикеты, требующие внимания отсуствуют")
  }
})

bot.action('ack', (ctx) => {
  // @ts-ignore
  let ticket_id = Number(ctx.update.callback_query.message.text.match(/^#(\d+)/gm)[0].replace('#', ''))
  tickets.ackTicket(ticket_id)
  ctx.reply(`Ack the ticket: #${ticket_id}\nCount unacked tickets: ${tickets.getUnAckedTicket().length}`)
})

bot.action('ackSlack', (ctx) => {
  slack.ackSlackNotification()
  console.log('Stop alerting on slack push notification')
  sendMessage('Все предыдущие оповещения были помечены, звонки по ним отключены')
})

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