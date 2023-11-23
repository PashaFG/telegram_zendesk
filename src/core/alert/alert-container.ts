import appConfig from "@config/app-config"
import { SlackEvent, SlackPingPongEvent } from "@core/slack/slack"
import { Ticket } from "@core/ticket/ticket"
import { AlertEvent } from "./alert-event"
import { EventType } from "@definitions/definitions-event"
import { log } from "@logger/logger"

const prefix = "[alert-container]"

export class AlertContainer {
    items: AlertEvent[]
    alertTime: number
    
    constructor() {
        this.items = []
        this.alertTime
    }

    get length() {
        return this.items.length
    }

    get needAlertCall() {
        return this.alertTime <= Date.now()
    }

    private isHaveEmergencyEvent() {
        return this.items.some(el => el.isEmergency)
    }

    private isExist(type: EventType, id: number): boolean {
        return this.items.some(item => item.type === type && item.body.id === id)
    }

    setNewAlertCallTime(force: boolean = false) {
        // every time need to reread config value
        const newAlertTime = (this.isHaveEmergencyEvent)
            ? Date.now() + <number>appConfig.getKey('alert.time.emergency')
            : Date.now() + <number>appConfig.getKey('alert.time.normal')

        if (force || !this.alertTime || this.alertTime <= Date.now() || this.alertTime > newAlertTime) {
            this.alertTime = newAlertTime
        }
    }

    addEvent(type: EventType, body: Ticket | SlackEvent | SlackPingPongEvent, tgMessageId: number): boolean {
        if (this.isExist(type, body.id)) { return false }

        this.items.push(new AlertEvent(type, body, tgMessageId))
        this.setNewAlertCallTime()
        return true
    }

    removeAlert(id: number) {
        this.items = this.items.filter(el => el.body.id !== id)

        if (!this.length) this.alertTime = 0
    }

    clearAllAlerts() {
        this.items.length = 0
        this.alertTime = 0
    }

    addTickets(tickets: Ticket[], tgMessageId: number) {
        tickets.forEach((ticket) => {
            this.addEvent(EventType.Ticket, ticket, tgMessageId)
        })
    }

    addSlackEvent(event: SlackEvent, tgMessageId: number) {
        this.addEvent(EventType.Slack, event, tgMessageId)
    }

    clearResolvedTickets(ticketsId: number[]) {
        this.items = this.items.filter(event => { 
            if (ticketsId.includes(event.body.id) && event.type === EventType.Ticket) { return false }
            
            return true
        })

        if (!this.length) this.alertTime = 0

        log(`${prefix} Amount events after cleared resolved tickets: ${this.length}`)
    }
}