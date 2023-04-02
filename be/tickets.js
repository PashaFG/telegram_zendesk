import dotenv from 'dotenv';
dotenv.config()


let oldTickets = []
let newTickets = []
let unAckTickets = []

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
      link: `https://itoolabs.zendesk.com/agent/tickets/${row.ticket_id}`,
      priority: row.ticket?.priority,
      sla: row.sla_next_breach_at
    })
  })
  return tickets
}

function saveTickets(array) {
  // переписывание двух массивов, необходимо для дальнейшего сравнения новых и старых тикетов
  oldTickets = newTickets
  newTickets = array
}

function checkDiffTickets() {
  // После пересохранения массивов происходит их сверка на различия
  if (oldTickets.length === 0) {
    console.log(`First update\n  Old ticket counts: ${oldTickets.length}\n  New tickets counts: ${newTickets.length}`);
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
      unAckTickets.push({
        ticket: element,
        alertTime: Date.now() + Number(process.env.ALERT_TIME)
      })
    }
  })

  if (hasUpdate) {
    console.log(`Tickets Updated\n  Old ticket counts: ${oldTickets.length}\n  New tickets counts: ${newTickets.length}`);
    console.log(JSON.stringify(updatedTickets));
    return {
      message: `Tickets Updated\n  Old ticket counts: ${oldTickets.length}\n  New tickets counts: ${newTickets.length}`,
      tickets: updatedTickets
    }
  } else {
    console.log(`No tickets have been updated\n  Old ticket counts: ${oldTickets.length}\n  New tickets counts: ${newTickets.length}`);
    return {
      message: `No tickets have been updated\n  Old ticket counts: ${oldTickets.length}\n  New tickets counts: ${newTickets.length}`
    }
  }
}

function ackTicket(ticket_id) {
  // После получения сообщения в боте /ack НОМЕР ТИКЕТА, он будет исключен из массива с тикетами для обзвона
  unAckTickets = unAckTickets.filter(ticket => ticket.ticket.id !== ticket_id)
  console.log(`Ack the ticket: ${ticket_id}\nCount unacked tickets: ${unAckTickets.length}`);
}

export default {
  matchTickets,
  saveTickets,
  checkDiffTickets,
  ackTicket,
  unAckTickets
}