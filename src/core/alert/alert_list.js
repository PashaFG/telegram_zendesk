// @ts-nocheck
import appConfig from '#core/config/app_config.js'

import { AlertEvent } from "./alert_event.js";

export class AlertList {
  constructor() {
    this.items = []
    this.alertTime
  }

  get length() {
    return this.items.length
  }

  get needAlert() {
    return (this.alertTime <= Date.now())
      ? true
      : false
  }

  #checkEmergency() {
    return (this.items.filter(el => el.isEmergency).length)
      ? true
      : false
  }

  setNewAlertTime(alertDelay, force) {
    if (force || this.alertTime > alertDelay || this.alertTime <= Date.now()) {
      this.alertTime = (this.#checkEmergency())
        ? Date.now() + appConfig.geKey('alert.time.normal')
        : Date.now() + appConfig.geKey('alert.time.emergency')
    }
  }

  addEvent(type, body) {
    this.items.push(new AlertEvent(type, body))
  }

  isExist(type, id) {
    return (this.items.find(element => { return (element.type === type && element.body.id === id) }))
      ? true
      : false
  }

  addTickets(tickets) {
    const typeEvent = "ticket"
    tickets.forEach((ticket) => {
      if (!this.isExist(typeEvent, ticket.id)) {
        this.items.push(new AlertEvent(typeEvent, ticket))
      }
    })
  }

  addSlackEvent(event) {
    const typeEvent = "slack"
    if (!this.isExist(typeEvent, event.id)) {
      this.items.push(new AlertEvent(typeEvent, event))
    }
  }

  clearResolvedTickets(ticketsId) {
    console.log(`[AlertList][clearResolvedTickets] ${JSON.stringify(ticketsId)}`)
    if (!ticketsId.length) {
      return
    }
    this.items = this.items.reduce((acc, cur) => {
      return (cur.type !== "ticket" || !ticketsId.includes(cur.body.id))
        ? [...acc, cur]
        : acc
    }, [])
  }
}