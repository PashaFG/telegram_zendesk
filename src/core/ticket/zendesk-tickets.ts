import appConfig from '@config/app-config'
import { log } from "@logger/logger.js";
import { Ticket } from "./ticket";
import { TicketEventConfig, ZendeskAlertCallback } from "@definitions/definitions-zendesk";

const prefix = "[zendesk-tickets]"

export class ZendeskTickets {
    url: string
    session: string
    oldTickets: Ticket[];
    newTickets: Ticket[];
    unAckTickets: Ticket[];
    alertCallback: ZendeskAlertCallback;
    users: number[];
    resolvedTickets: number[];
    lastSuccessTicketsRequest: number
 
    constructor(url: string, session: string) {
      this.url = url
      this.session = session
      this.oldTickets = []
      this.newTickets = []
      this.unAckTickets = []
      this.oldTickets = []
      this.resolvedTickets = []
      this.alertCallback
      this.users = []
      this.lastSuccessTicketsRequest = 0
    }

    private reSaveTickets(rawTickets: TicketEventConfig[]) {
        this.oldTickets = this.newTickets
        this.newTickets = rawTickets.map(ticket => new Ticket(ticket))
    }

    private checkDefault(): Ticket[] {
        this.newTickets.forEach(ticket => {
            const oldTicket = this.oldTickets.find(oldTicket => ticket.id === oldTicket.id)
            const hasTicket = this.unAckTickets.find(unAckTicket => ticket.id === unAckTicket.id)

            if (!hasTicket && (!oldTicket || ticket.dateUpdate !== oldTicket?.dateUpdate)) {
                log(`${prefix} Require ticket to alert: ${ticket.id} because: {oldTicket: ${!oldTicket}, dateUpdate: ${ticket.dateUpdate !== oldTicket?.dateUpdate}}`)
                this.unAckTickets.push(ticket)
            }
        })

        return this.unAckTickets
    }

    private checkWithUserAssign(): Ticket[] {
        this.newTickets.forEach(ticket => {
            const oldTicket = this.oldTickets.find(oldTicket => ticket.id === oldTicket.id)
            const hasTicket = this.unAckTickets.find(unAckTicket => ticket.id === unAckTicket.id)

            if (!hasTicket && (!oldTicket || (ticket.dateUpdate !== oldTicket.dateUpdate && (oldTicket.assigned === null && ticket.assigned !== appConfig.getKey('zendesk.user.id'))))) {
               this.unAckTickets.push(ticket)
            }
        })

        return this.unAckTickets
    }

    private checkWithGroupAssign(): Ticket[] {
        this.newTickets.forEach(ticket => {
            const oldTicket = this.oldTickets.find(oldTicket => ticket.id === oldTicket.id)
            const hasTicket = this.unAckTickets.find(unAckTicket => ticket.id === unAckTicket.id)

            if (!hasTicket && (!oldTicket || (ticket.dateUpdate !== oldTicket.dateUpdate && (oldTicket.assigned === null && !this.users.includes(ticket.assigned))))) {
               this.unAckTickets.push(ticket)
            }
        })

        return this.unAckTickets
    }

    private findResolved(): number[] {
        if (this.resolvedTickets?.length) { this.resolvedTickets.length = 0 }
        const newTicketsId = this.newTickets.reduce((acc, cur) => { return [...acc, cur.id] }, [])

        this.oldTickets.forEach(ticket => {
            if (!newTicketsId.includes(ticket.id)) {
               this.resolvedTickets.push(ticket.id)
            }
        })

        return this.resolvedTickets
    }

    fetchTickets = async () => {
        try {
            if (!appConfig.getKey('alert.zendesk_alerting')) { return }

            const url = this.url
            log(`${prefix} http => ${url}`)

            const response = await fetch(url, {
                headers: {
                    Cookie: `_zendesk_shared_session=${this.session}`,
                },
            })

            if (!response.ok) {
                const status = response.status
                throw new Error(`http <= ${status}`)
            }

            log(`${prefix} http <= ${response.status}`)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.reSaveTickets((<{ rows: any[] }> await response.json()).rows)
            this.lastSuccessTicketsRequest = Date.now()

            log(`${prefix} New tickets (Amount=${this.newTickets.length}): [${this.newTickets.map(ticket => ticket.id).join(';')}]`)
            log(`${prefix} Old tickets (Amount=${this.oldTickets.length}): [${this.oldTickets.map(ticket => ticket.id).join(';')}]`)

            if (this.oldTickets.length) {
                this.alertCallback(this.checkTickets(), this.findResolved())
            }

            return this.newTickets

        } catch (e) {
            log(`${prefix} Error: ${String(e)}`)
        }
    }

    async startFetching(delay = 1000 * 60) {
        log(`${prefix} Start fetching with delay ${delay}`)
        await this.fetchTickets()
        return setInterval(this.fetchTickets.bind(this), delay)
    }

    checkTickets() {
        switch (appConfig.getKey("alert.zendesk_alerting_type")) {
            case "default":
                return this.checkDefault()

            case "user":
               return this.checkWithUserAssign()

            case "group":
                return this.checkWithGroupAssign()

            default:
                return []
        }
    }

    clearUnAckTickets() {
        this.unAckTickets.length = 0
    }

    clearResolvedTickets() {
        this.resolvedTickets.length = 0
    }

    startAlert(callback: ZendeskAlertCallback) {
        this.alertCallback = callback
    }

    setUsers(usersId: number[]) {
        this.users = usersId
    }
}