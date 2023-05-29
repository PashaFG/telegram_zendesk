import { Telegraf } from 'telegraf';
import { setupUser, clearUser, getUser } from '../call/apiVats.js'
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
  try {
    if (!buttons) {
      inputMessage.reply(text);
    } else {
      inputMessage.reply(text, buttons)
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'sendMessage', message: `${String(e)}` })
  }
}


const bot = new Telegraf(String(tokenBot));

bot.help((ctx) => {
  try {
    logger.log({ level: 'info', label: 'bot', message: `Insert command '/help'`, })
    inputMessage = ctx
    logger.log({ level: 'info', label: 'bot', subLabel: 'help', message: `Send instruction`, })
    const commands = [
      "/start - Настраивает сотрудника в ВАТС, включает сервис получения обращений, включает оповещения о событиях и последующие звонки",
      "/stop - Удаляет настройку сотрудника в ВАТС, отключает получение обращений и оповещения о событиях",
      "/ack 000000 - Подтверждает обращение номер 000000 и отменяет последующий звонок по нему",
      "/slack - Подтверждает ВСЕ полученные сообщения от SLACK и отключает оповещения по ним",
      "/getUnackedTickets - возвращает список тикетов, находящихся без подтверждения",
    ]
    sendMessage(commands.join('\n'))
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'help', message: `${String(e)}` })
  }
})

bot.command('stop', (ctx) => {
  try {
    // Остановка отправки оповещений, очистка переадресации у сотрудника
    logger.log({ level: 'info', label: 'bot', message: `Insert command '/stop'`, })
    inputMessage = ctx
    alertingOn = false
    logger.log({ level: 'info', label: 'bot', subLabel: 'stop', message: `Send request to clear user`, })
    clearUser()
    logger.log({ level: 'info', label: 'bot', subLabel: 'stop', message: `New alert status: ${alertingOn}`, })
    sendMessage(`Оповещения отключены.\nНомер для сотрудника отключен, переадресация отключена`)
    logger.log({ level: 'info', label: 'bot', subLabel: 'stop', message: `Send req to [tickets][getTicketIntervalId]`, })
    let intervalId = tickets.getTicketIntervalId()
    if (intervalId) {
      tickets.clearTicketIntervalID()
      logger.log({ level: 'info', label: 'bot', subLabel: 'stop', message: `Fetch ticket have intrevalId: ${intervalId}, now it\`s clearing: ${tickets.getTicketIntervalId()}`, })
    } else {
      logger.log({ level: 'info', label: 'bot', subLabel: 'stop', message: `Fetch ticket have not intrevalId: ${intervalId}, nothing to clear`, })
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'stop', message: `${String(e)}` })

  }
})

bot.command('start', (ctx) => {
  try {
    // Включение оповещений, настройка сотрудника для звонков
    logger.log({ level: 'info', label: 'bot', message: `insert command '/start'`, })
    inputMessage = ctx
    alertingOn = true
    logger.log({ level: 'info', label: 'bot', subLabel: 'start', message: `Send request to setup user`, })
    setupUser()
    logger.log({ level: 'info', label: 'bot', subLabel: 'start', message: `New alert status: ${alertingOn}`, })
    sendMessage(`Оповещения включены.\nДля сотрудника ${process.env.VATS_USER} был назначен номер для оповещений ${process.env.VATS_TELNUM}`)
    logger.log({ level: 'info', label: 'bot', subLabel: 'start', message: `Send req to [tickets][getTicketIntervalId]`, })
    let intervalId = tickets.getTicketIntervalId()
    if (intervalId) {
      tickets.setTicketIntervalId(setInterval(tickets.fetchTicket, Number(process.env.FETCH_TIME)))
      logger.log({ level: 'info', label: 'bot', subLabel: 'start', message: `Fetch ticket have intrevalId: ${intervalId}, now it\`s set to: ${tickets.getTicketIntervalId()}`, })
    } else {
      tickets.setTicketIntervalId(setInterval(tickets.fetchTicket, Number(process.env.FETCH_TIME)))
      logger.log({ level: 'info', label: 'bot', subLabel: 'start', message: `Fetch ticket have not intrevalId: ${intervalId}, now it\`s set to: ${tickets.getTicketIntervalId()}`, })
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'start', message: `${String(e)}` })
  }
});

bot.command('ack', (ctx) => {
  try {
    // "Подтверждение" оповещения о тикете.
    logger.log({ level: 'info', label: 'bot', message: `Insert command '/ack'`, })
    let ticket_id = Number(ctx.update.message.text.replace('/ack ', ''))
    logger.log({ level: 'info', label: 'bot', subLabel: 'ack', message: `Ticket: ${ticket_id}`, })
    tickets.ackTicket(ticket_id)
    ctx.reply(`Ack the ticket: ${ticket_id}\nCount unacked tickets: ${tickets.getUnAckedTicket().length}`)
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'ack', message: `${String(e)}` })
  }
});

bot.command('slack', (ctx) => {
  try {
    // "Подтверждение" оповещения об уведомлении в слаке.
    logger.log({ level: 'info', label: 'bot', message: `Insert command '/slack'`, })
    slack.ackSlackNotification()
    logger.log({ level: 'info', label: 'bot', subLabel: 'slack', message: `Stop alerting on slack push notification`, })
    sendMessage('Все предыдущие оповещения были помечены, звонки по ним отключены')
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'slack', message: `${String(e)}` })
  }
});

bot.command('getUnackedTickets', (ctx) => {
  try {
    logger.log({ level: 'info', label: 'bot', message: `Insert command '/getUnackedTickets'`, })
    inputMessage = ctx
    const unacked = tickets.getUnAckedTicket()
    if (unacked.length > 0) {
      let string = ''
      unacked.forEach((ticket) => {
        string += `#${ticket.ticket.id} - ${(ticket.ticket.sla) ? String(Math.floor((Date.parse(ticket.ticket.sla) - Date.now()) / 60000)) + "min" : "not SLA"}; Time to alert call: ${Math.floor((Date.now() - ticket.alertTime) / 60000)} min\n`
      })
      logger.log({ level: 'info', label: 'bot', subLabel: 'getUnackedTickets', message: `Un acked tickets: ${string}`, })
      sendMessage(string)
    } else {
      logger.log({ level: 'info', label: 'bot', subLabel: 'getUnackedTickets', message: `Un acked tickets are empty`, })
      sendMessage("Тикеты, требующие внимания отсуствуют")
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'getUnackedTickets', message: `${String(e)}` })
  }
})

bot.command('status', async (ctx) => {
  try {
    logger.log({ level: 'info', label: 'bot', message: `Insert command '/status'`, })
    inputMessage = ctx
    let user = getUser()
    // @ts-ignore
    let vatsStatus = (!user?.errors) ? true : false
    // @ts-ignore
    let userSettings = (user?.mobile !== "" && user?.mobile_redirect.enabled && user?.mobile_redirect.forward) ? true : false
    let intervalId = (tickets.getTicketIntervalId() !== undefined) ? true : false
    let fetchStatus = await tickets.fetchTicket()

    // @ts-ignore
    logger.log({ level: 'info', label: 'bot', subLabel: 'status', message: `Vats: ${(vatsStatus) ? "OK" : "error"}; User: ${(userSettings) ? "OK" : "not configured"}; Fetching tickets: ${(intervalId) ? "OK" : "is not fetching"}; Fetch status: ${(fetchStatus >= 200 && fetchStatus <= 299) ? "OK" : "error"}`, })

    sendMessage(`Доступность интеграции с ВАТС: ${(vatsStatus) ? "OK" : "ошибка"}; \nНастройка сотрудника: ${(userSettings) ? "Выполнена" : "Сотрудник не настроен"}; \nПроцесс запроса обращений: ${(intervalId) ? "OK" : "Процесс не запущен"}; \nТестовый запрос обращения: ${(fetchStatus >= 200 && fetchStatus <= 299) ? "OK" : "error"}`)


  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'status', message: `${String(e)}` })
  }
})

bot.action('ack', (ctx) => {
  try {
    // @ts-ignore
    let ticket_id = Number(ctx.update.callback_query.message.text.match(/^#(\d+)/gm)[0].replace('#', ''))
    tickets.ackTicket(ticket_id)
    logger.log({ level: 'info', label: 'bot', subLabel: 'action', message: `Ack ${ticket_id}`, })
    ctx.reply(`Ack the ticket: #${ticket_id}\nCount unacked tickets: ${tickets.getUnAckedTicket().length}`)
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'action', message: `${String(e)}` })
  }
})

bot.action('ackSlack', (ctx) => {
  try {
    slack.ackSlackNotification()
    logger.log({ level: 'info', label: 'bot', subLabel: 'action', message: `Ack slack. Stop alerting on slack push notification`, })
    sendMessage('Все предыдущие оповещения были помечены, звонки по ним отключены')
  } catch (e) {
    logger.log({ level: 'error', label: 'bot', subLabel: 'action', message: `${String(e)}` })
  }
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