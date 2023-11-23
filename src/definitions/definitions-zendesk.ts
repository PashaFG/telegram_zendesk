import { Ticket } from "@core/ticket/ticket";

export type ZendeskAlertCallback = (inpTickets: Ticket[], resolvedTickets: number[]) => void

interface LocalTicket {
    status: string
    url: string
    priority: string
}

export interface TicketEventConfig {
    ticket_id: number
    subject: string
    updated: string
    ticket: LocalTicket
    sla_next_breach_at: string
    assignee_id: number
}

export interface TicketUsers {
    id: number,
    name: string
}