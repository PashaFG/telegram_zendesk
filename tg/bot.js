import { Telegraf } from 'telegraf';
import { setupUser, clearUser } from '../call/apiVats.js'
import { logger } from "../be/logger.js"
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
  logger.log({ level: 'info', label: 'bot', message: `Insert command '/help'`, })
  inputMessage = ctx
  logger.log({ level: 'info', label: 'bot', subLable: 'help', message: `Send instruction`, })
  const commands = [
    "/start - Настраивает сотрудника в ВАТС, включает сервис получения обращений, включает оповещения о событиях и последующие звонки",
    "/stop - Удаляет настройку сотрудника в ВАТС, отключает получение обращений и оповещения о событиях",
    "/ack 000000 - Подтверждает обращение номер 000000 и отменяет последующий звонок по нему",
    "/slack - Подтверждает ВСЕ полученные сообщения от SLACK и отключает оповещения по ним",
    "/getUnackedTickets - возвращает список тикетов, находящихся без подтверждения",
  ]
  sendMessage(commands.join('\n'))
})

bot.command('stop', (ctx) => {
  // Остановка отправки оповещений, очистка переадресации у сотрудника
  logger.log({ level: 'info', label: 'bot', message: `Insert command '/stop'`, })
  alertingOn = false
  logger.log({ level: 'info', label: 'bot', subLable: 'stop', message: `Send request to clear user`, })
  clearUser()
  logger.log({ level: 'info', label: 'bot', subLable: 'stop', message: `New alert status: ${alertingOn}`, })
  sendMessage(`Оповещения отключены.\nНомер для сотрудника отключен, переадресация отключена`)
  let intervalId = tickets.getTicketIntervalId()
  if (intervalId) {
    tickets.clearTicketIntervalID()
    logger.log({ level: 'info', label: 'bot', subLable: 'stop', message: `Fetch ticket have intrevalId: ${intervalId}, now it\`s clearing: ${tickets.getTicketIntervalId()}`, })
  } else {
    logger.log({ level: 'info', label: 'bot', subLable: 'stop', message: `Fetch ticket have not intrevalId: ${intervalId}, nothing to clear`, })
  }
})

bot.command('start', (ctx) => {
  // Включение оповещений, настройка сотрудника для звонков
  logger.log({ level: 'info', label: 'bot', message: `insert command '/start'`, })
  inputMessage = ctx
  alertingOn = true
  logger.log({ level: 'info', label: 'bot', subLable: 'start', message: `Send request to setup user`, })
  setupUser()
  logger.log({ level: 'info', label: 'bot', subLable: 'start', message: `New alert status: ${alertingOn}`, })
  sendMessage(`Оповещения включены.\nДля сотрудника ${process.env.VATS_USER} был назначен номер для оповещений ${process.env.VATS_TELNUM}`)
  let intervalId = tickets.getTicketIntervalId()
  if (intervalId) {
    logger.log({ level: 'info', label: 'bot', subLable: 'start', message: `Fetch ticket have intrevalId: ${intervalId}, now it\`s set to: ${tickets.getTicketIntervalId()}`, })
    tickets.setTicketIntervalId(setInterval(tickets.fetchTicket, Number(process.env.FETCH_TIME)))
  } else {
    logger.log({ level: 'info', label: 'bot', subLable: 'start', message: `Fetch ticket have not intrevalId: ${intervalId}, now it\`s set to: ${tickets.getTicketIntervalId()}`, })
    tickets.setTicketIntervalId(setInterval(tickets.fetchTicket, Number(process.env.FETCH_TIME)))
  }
});

bot.command('ack', (ctx) => {
  // "Подтверждение" оповещения о тикете.
  logger.log({ level: 'info', label: 'bot', message: `Insert command '/ack'`, })
  let ticket_id = Number(ctx.update.message.text.replace('/ack ', ''))
  logger.log({ level: 'info', label: 'bot', subLable: 'ack', message: `Ticket: ${ticket_id}`, })
  tickets.ackTicket(ticket_id)
  ctx.reply(`Ack the ticket: ${ticket_id}\nCount unacked tickets: ${tickets.getUnAckedTicket().length}`)
});

bot.command('slack', (ctx) => {
  // "Подтверждение" оповещения об уведомлении в слаке.
  logger.log({ level: 'info', label: 'bot', message: `Insert command '/slack'`, })
  slack.ackSlackNotification()
  logger.log({ level: 'info', label: 'bot', subLable: 'slack', message: `Stop alerting on slack push notification`, })
  sendMessage('Все предыдущие оповещения были помечены, звонки по ним отключены')
});

bot.command('getUnackedTickets', (ctx) => {
  logger.log({ level: 'info', label: 'bot', message: `Insert command '/getUnackedTickets'`, })
  inputMessage = ctx
  const unacked = tickets.getUnAckedTicket()
  if (unacked.length > 0) {
    let string = ''
    unacked.forEach((ticket) => {
      string += `#${ticket.ticket.id} - ${(ticket.ticket.sla) ? String(Math.floor((Date.parse(ticket.ticket.sla) - Date.now()) / 60000)) + "min" : "not SLA"}; Time to alert call: ${Math.floor((Date.now() - ticket.alertTime) / 60000)} min\n`
    })
    logger.log({ level: 'info', label: 'bot', subLable: 'slack', message: `Un acked tickets: ${string}`, })
    sendMessage(string)
  } else {
    logger.log({ level: 'info', label: 'bot', subLable: 'slack', message: `Un acked tickets are empty`, })
    sendMessage("Тикеты, требующие внимания отсуствуют")
  }
})

bot.action('ack', (ctx) => {
  // @ts-ignore
  let ticket_id = Number(ctx.update.callback_query.message.text.match(/^#(\d+)/gm)[0].replace('#', ''))
  tickets.ackTicket(ticket_id)
  logger.log({ level: 'info', label: 'bot', subLable: 'action', message: `Ack ${ticket_id}`, })
  ctx.reply(`Ack the ticket: #${ticket_id}\nCount unacked tickets: ${tickets.getUnAckedTicket().length}`)
})

bot.action('ackSlack', (ctx) => {
  slack.ackSlackNotification()
  logger.log({ level: 'info', label: 'bot', subLable: 'action', message: `Ack slack. Stop alerting on slack push notification`, })
  sendMessage('Все предыдущие оповещения были помечены, звонки по ним отключены')
})

bot.launch();

logger.log({ level: 'info', label: 'server', message: `Bot is starting`, })
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

function getAlertingStatus() {
  logger.log({ level: 'info', label: 'bot', message: `Send alert status: ${alertingOn}`, })
  return alertingOn
}

function getInputMessage() {
  logger.log({ level: 'info', label: 'bot', message: `Send inputMessage object`, })
  return inputMessage
}

export {
  getInputMessage,
  getAlertingStatus,
  sendMessage
}