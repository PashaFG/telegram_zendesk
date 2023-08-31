// @ts-nocheck
import appConfig from '#core/config/app_config.js'
import { logger } from "#utils/logger/logger.js";
import { Ticket } from "./ticket.js";

export class ZendeskTickets {
  constructor(url, session) {
    this.url = url
    this.session = session
    this.oldTickets = []
    this.newTickets = []
    this.unAckTickets = []
    this.resolvedTickets = []
    this.interval
    this.alertCallback
    this.users
  }

  #reSaveTickets(rawTickets) {
    this.oldTickets = this.newTickets
    this.newTickets = rawTickets.map(ticket => new Ticket(ticket))
  }

  #checkDefault() {
    this.newTickets.forEach(ticket => {
      const oldTicket = this.oldTickets.find(oldTicket => ticket.id === oldTicket.id)
      const hasTicket = this.unAckTickets.find(unAckTicket => ticket.id === unAckTicket.id)

      if (!hasTicket && (!oldTicket || ticket.dateUpdate !== oldTicket?.dateUpdate)) {
        logger.log({ level: 'info', label: 'ZendeskTickets', subLabel: 'checkDefault', message: `Require ticket to alert: ${ticket.id} because: {oldTicket: ${!oldTicket}, dateUpdate: ${ticket.dateUpdate !== oldTicket?.dateUpdate}}`, })
        this.unAckTickets.push(ticket)
      }
    })

    return this.unAckTickets
  }

  #checkWithUserAssign() {
    this.newTickets.forEach(ticket => {
      const oldTicket = this.oldTickets.find(oldTicket => ticket.id === oldTicket.id)
      const hasTicket = this.unAckTickets.find(unAckTicket => ticket.id === unAckTicket.id)

      if (!hasTicket && (!oldTicket || (ticket.dateUpdate !== oldTicket.dateUpdate && (oldTicket.assigned === null && ticket.assigned !== appConfig.getKey('zendesk.user'))))) {
        this.unAckTickets.push(ticket)
      }
    })

    return this.unAckTickets
  }

  #checkWithGroupAssign() {
    this.newTickets.forEach(ticket => {
      const oldTicket = this.oldTickets.find(oldTicket => ticket.id === oldTicket.id)
      const hasTicket = this.unAckTickets.find(unAckTicket => ticket.id === unAckTicket.id)

      if (!hasTicket && (!oldTicket || (ticket.dateUpdate !== oldTicket.dateUpdate && (oldTicket.assigned === null && !this.users.includes(ticket.assigned))))) {
        this.unAckTickets.push(ticket)
      }
    })

    return this.unAckTickets
  }

  #findResolved() {
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
      if (appConfig.getKey('alert.zendesk_alerting')) {

        const url = this.url
        logger.log({ level: 'info', label: 'ZendeskTickets', subLabel: 'fetchTicket', message: `http => ${url}`, })

        let response = await fetch(url, {
          headers: {
            Cookie: `_zendesk_shared_session=${this.session}`
          }
        })

        if (!response.ok) {
          const status = response.status
          response.json().then((data) => {
            throw new Error(`http <= ${status} ${data.body}`)
          })
        } else {
          logger.log({ level: 'info', label: 'ZendeskTickets', subLabel: 'fetchTicket', message: `http <= ${response.status}`, })
          this.#reSaveTickets((await response.json()).rows)

          logger.log({ level: 'info', label: 'ZendeskTickets', subLabel: 'fetchTicket', message: `New tickets (Amount=${this.newTickets.length}): [${this.newTickets.map(ticket => ticket.id).join(';')}]`, })
          logger.log({ level: 'info', label: 'ZendeskTickets', subLabel: 'fetchTicket', message: `Old tickets (Amount=${this.oldTickets.length}): [${this.oldTickets.map(ticket => ticket.id).join(';')}]`, })

          if (this.oldTickets.length) {
            this.alertCallback(this.checkTickets(), this.#findResolved())
          }
        }

        return this.newTickets
      }
    } catch (e) {
      logger.log({ level: 'error', label: 'ZendeskTickets', subLabel: 'fetchTicket', message: `${String(e)}`, })
    }
  }

  async startFetching(delay = 1000 * 60, users) {
    logger.log({ level: 'info', label: 'ZendeskTickets', message: `Start fetching with delay ${delay}. List of users received, amount users: ${users.length}`, })
    this.users = users
    await this.fetchTickets()
    let intervalId = setInterval(this.fetchTickets.bind(this), delay)
    this.interval = intervalId
    return intervalId
  }
  stopFetching() {
    logger.log({ level: 'info', label: 'ZendeskTickets', message: `Stop fetching`, })
    clearInterval(this.interval)
  }

  checkTickets() {
    switch (appConfig.getKey("alert.zendesk_alerting_type")) {
      case "default":
        return this.#checkDefault()

      case "user":
        return this.#checkWithUserAssign()

      case "group":
        return this.#checkWithGroupAssign()

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

  startAlert(callback) {
    this.alertCallback = callback
  }
}