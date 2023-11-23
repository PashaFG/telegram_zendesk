import { SlackEvent, SlackPingPongEvent } from "@core/slack/slack"
import { Ticket } from "@core/ticket/ticket"
import { EventType } from "@definitions/definitions-event"

export class AlertEvent {
    type: EventType
    body: SlackEvent | Ticket | SlackPingPongEvent
    tgMessageId: number

    constructor(type: EventType, body: SlackEvent | Ticket | SlackPingPongEvent, tgMessageId: number) {
        this.type = type
        this.body = body
        this.tgMessageId = tgMessageId
    }

    get isEmergency() {
        return this.body.isEmergency
    }
}