import { TicketUsers } from "@definitions/definitions-zendesk";

export interface ZendeskExecuteTicket {
    custom_fields: string[]
    ticket_id: number
    organization_id: number
    subject: string
    created: string
    updated: string
    sla_next_breach_at: null | number
    assignee_id: null | number
    fields: string[]
    tickets: {
        id: number
        subject: string
        description: string
        is_group_public: boolean
        status: string
        type: null | string
        priority: string
        url: string
        via_id: number
    }
}

interface ZendeskExecuteColumns {
    id: string
    title: string
    filterable: boolean
    sortable: boolean
}

export interface ZendeskExecute {
    rows: ZendeskExecuteTicket[],
    columns: ZendeskExecuteColumns[]
    view: {
        id: number
        url: string
    }
    organizations: number[]
    users: TicketUsers[]
    next_page: null | string
    previous_page: null | string
    count: number
}