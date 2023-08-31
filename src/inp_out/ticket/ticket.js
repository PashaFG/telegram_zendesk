// @ts-nocheck
export class Ticket {
  alertTime

  constructor(data) {
    this.id = data.ticket_id
    this.subject = data.subject
    this.dateUpdate = data.updated
    this.status = data.ticket?.status
    this.link = this.#remakeUrl(data.ticket.url)
    this.priority = data.ticket?.priority
    this.sla = data.sla_next_breach_at
    this.assigned = data.assignee_id
    this.isEmergency = this.#checkEmergency(data.ticket.priority)
  }

  #checkEmergency(priority) {
    return (priority !== "hight")
      ? false
      : true
  }

  #remakeUrl(rawUrl) {
    return rawUrl.replaceAll(/(api\/v2\/|\.json)/gm, '')
  }
}