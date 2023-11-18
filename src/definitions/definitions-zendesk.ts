interface Ticket {
    status: string
    url: string
    priority: string
}

export interface TicketEventConfig {
    ticket_id: number
    subject: string
    updated: string
    ticket: Ticket
    sla_next_breach_at: number
    assignee_id: number
}

export interface TicketUsers {
    id: number,
    name: string
}