import { TicketEventConfig } from '@definitions/definitions-zendesk'

export class Ticket {
    id: number
    subject: string
    dateUpdate: string
    status: string
    link: string
    priority: string
    sla: string
    assigned: number
    isEmergency: boolean
    
  constructor(data: TicketEventConfig) {
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

  #checkEmergency(priority: string): boolean {
    return priority === "high"
  }

  #remakeUrl(rawUrl: string) {
    return rawUrl.replaceAll(/(api\/v2\/|\.json)/gm, '')
  }
}