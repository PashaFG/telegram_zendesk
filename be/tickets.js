import { logger } from "./logger.js"
import dotenv from 'dotenv';
dotenv.config()


let oldTickets = []
let newTickets = []
let unAckTickets = []
let ticketIntervalId

function matchTickets(rawArray) {
  // Преобразование полученный информации в минимально-удобночитабельный вид
  let tickets = []
  rawArray.forEach(row => {
    tickets.push({
      id: row.ticket_id,
      subject: row.subject,
      dateCreated: row.created,
      dateUpdate: row.updated,
      status: row.ticket?.status,
      link: `https://${process.env.ZENDESK_DOMAIN}/agent/tickets/${row.ticket_id}`,
      priority: row.ticket?.priority,
      sla: row.sla_next_breach_at
    })
  })
  logger.log({ level: 'info', label: 'tickets', subLable: 'matchTickets', message: `Tickets transformed: ${JSON.stringify(tickets)}`, })
  return tickets
}

function saveTickets(array) {
  // переписывание двух массивов, необходимо для дальнейшего сравнения новых и старых тикетов
  oldTickets = newTickets
  newTickets = array
  logger.log({ level: 'info', label: 'tickets', subLable: 'saveTickets', message: `Tickets has been resaved`, })
}

function checkDiffTickets() {
  // После пересохранения массивов происходит их сверка на различия
  if (oldTickets.length === 0) {
    logger.log({ level: 'info', label: 'tickets', subLable: 'checkDiffTickets', message: `First update Old counts: ${oldTickets.length} New counts: ${newTickets.length}`, })
    return
  }
  let hasUpdate = false
  let updatedTickets = []
  newTickets.forEach((element, index) => {
    let oldTicket = oldTickets.find(ticket => ticket.id == element.id)
    if (!oldTicket || element.dateUpdate !== oldTicket.dateUpdate) {
      // Проверка происходит только по двум принципам, тикета не было в старых данных, в тикете изменилась дата последнего изменения
      hasUpdate = true
      updatedTickets.push(element)
      let alertTime = (element.priority === "high") ? Date.now() + Number(process.env.ALERT_TIME_EMERGENCY) : Date.now() + Number(process.env.ALERT_TIME)
      unAckTickets.push({
        ticket: element,
        alertTime: alertTime
      })
    }
  })

  if (hasUpdate) {
    logger.log({ level: 'info', label: 'tickets', subLable: 'checkDiffTickets', message: `Tickets Updated Old counts: ${oldTickets.length} New counts: ${newTickets.length}. Update: ${JSON.stringify(updatedTickets)}`, })
    return {
      message: `Tickets Updated\n  Old ticket counts: ${oldTickets.length}\n  New tickets counts: ${newTickets.length}`,
      tickets: updatedTickets
    }
  } else {
    logger.log({ level: 'info', label: 'tickets', subLable: 'checkDiffTickets', message: `No tickets have been updated Old counts: ${oldTickets.length} New counts: ${newTickets.length}`, })
    return {
      message: `No tickets have been updated\n  Old ticket counts: ${oldTickets.length}\n  New tickets counts: ${newTickets.length}`
    }
  }
}

function ackTicket(ticket_id) {
  logger.log({ level: 'info', label: 'tickets', subLable: 'ackTicket', message: `Received ack to: ${ticket_id}`, })
  // После получения сообщения в боте /ack НОМЕР ТИКЕТА, он будет исключен из массива с тикетами для обзвона
  unAckTickets = unAckTickets.filter(ticket => ticket.ticket.id !== ticket_id)
  let text = `Ack the ticket: ${ticket_id}\nCount unacked tickets: ${unAckTickets.length}`
  logger.log({ level: 'info', label: 'tickets', subLable: 'ackTicket', message: `Ack the ticket: ${ticket_id}. Count unacked tickets: ${unAckTickets.length}`, })
}

function getUnAckedTicket() {
  logger.log({ level: 'info', label: 'tickets', subLable: 'getUnAckedTicket', message: `Unacked tickets: ${unAckTickets}`, })
  return unAckTickets
}
async function fetchTicket() {
  logger.log({ level: 'info', label: 'tickets', subLable: 'fetchTicket', message: `Fetch tickets`, })
  logger.log({ level: 'info', label: 'server', message: `HTTPS => https://${process.env.ZENDESK_DOMAIN}/api/v2/views/${process.env.ZENDESK_VIEWS_ID}/execute.json?exclude=sla_next_breach_at`, })
  let response = await fetch(`https://${process.env.ZENDESK_DOMAIN}/api/v2/views/${process.env.ZENDESK_VIEWS_ID}/execute.json?exclude=sla_next_breach_at`, {
    headers: {
      Cookie: `_zendesk_shared_session=${process.env.ZENDESK_SHARED_SESSION}`
    }
  })
  if (response.ok) {
    logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status}`, })
    let json = await response.json();
    logger.log({ level: 'info', label: 'tickets', subLable: 'fetchTicket', message: `Body: ${json}`, })
    let data = { "text": json.rows }
    logger.log({ level: 'info', label: 'tickets', subLable: 'fetchTicket', message: `Send tickets to server: ${data}`, })
    fetch(`http://localhost:${process.env.SERVER_PORT}/api/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  } else {
    logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status}`, })
    return response.status
  }
}

function setTicketIntervalId(intervalID) {
  logger.log({ level: 'info', label: 'tickets', subLable: 'setTicketIntervalId', message: `Set interval to fetching: ${intervalID}`, })
  ticketIntervalId = intervalID
}
function getTicketIntervalId() {
  logger.log({ level: 'info', label: 'tickets', subLable: 'setTicketIntervalId', message: `Current fetching interval: ${ticketIntervalId}`, })
  return ticketIntervalId
}
function clearTicketIntervalID() {
  logger.log({ level: 'info', label: 'tickets', subLable: 'setTicketIntervalId', message: `Clear fetching interval`, })
  ticketIntervalId = null
}

export default {
  matchTickets,
  saveTickets,
  checkDiffTickets,
  ackTicket,
  getUnAckedTicket,
  fetchTicket,
  setTicketIntervalId,
  getTicketIntervalId,
  clearTicketIntervalID
}