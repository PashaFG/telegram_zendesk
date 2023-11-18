import appConfig from "@config/app-config"
import { SlackEvent } from "@core/slack/slack"
import { Ticket } from "@core/ticket/ticket"
import { AlertEvent } from "./alert-event"
import { EventType } from "@definitions/definitions-event"
import { log } from "@logger/logger"

const prefix = "[alert-container]"

export class AlertContainer {
    items: AlertEvent[]
    alertTime: number
    
    constructor() {
        this.items = [],
        this.alertTime
    }

    get length() {
        return this.items.length
    }

    get needAlertCall() {
        return this.alertTime <= Date.now()
    }

    #isHaveEmergencyEvent() {
        return this.items.some(el => el.isEmergency)
    }

    setNewAlertCallTime(force: boolean = false) {
        if (force || !this.alertTime || this.alertTime <= Date.now()) {
            // every time need to reread config value
            this.alertTime = (this.#isHaveEmergencyEvent)
                ? Date.now() + <number>appConfig.getKey('alert.time.emergency')
                : Date.now() + <number>appConfig.getKey('alert.time.normal')
        }
    }

    #isExist(type: EventType, id: number): boolean {
        return this.items.some(item => item.type === type && item.body.id === id)
    }

    addEvent(type: EventType, body: Ticket | SlackEvent): boolean {
        if (this.#isExist(type, body.id)) { return false }

        this.items.push(new AlertEvent(type, body))
        this.setNewAlertCallTime()
        return true
    }

    removeAlert(id: number) {
        this.items = this.items.filter(el => el.body.id !== id)
    }

    clearAllAlerts() {
        this.items.length = 0
    }

    addTickets(tickets: Ticket[]) {
        tickets.forEach((ticket) => {
            this.addEvent("ticket", ticket)
        })
    }

    addSlackEvent(event: SlackEvent) {
        this.addEvent("slack", event)
    }

    clearResolvedTickets(ticketsId: number[]) {
        this.items = this.items.filter(event => { 
            if (ticketsId.includes(event.body.id) && event.type === "ticket") { return false }
            
            return true
        })

        log(`${prefix} Amount events after cleared resolved tickets: ${this.length}`)
    }
}