// @ts-nocheck
export class AlertEvent {
  constructor(type, body) {
    this.type = type
    this.body = body
    this.tgMessageId
  }

  get isEmergency() {
    return this.body.isEmergency
  }
}