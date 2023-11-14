import appConfig from '@config/app-config'
import { SlackEventConfig } from '@definitions/definitions-slack'
import { SlackConfigEmergencyType } from '@definitions/definitions-config'

export class SlackEvent {
    id: number
    eventContent: string
    eventChannel: string
    eventSubtitle: string
    isEmergency: boolean
    
  constructor(data: SlackEventConfig) {
    this.id = Math.floor(Number(data.event_ts) * 1000000)
    this.eventContent = data.content
    this.eventChannel = data.channel
    this.eventSubtitle = data.subtitle
    this.isEmergency = this.#checkEmergency()
  }

  #checkEmergency(): boolean {
    const { channel, people, content } = <SlackConfigEmergencyType>appConfig.getKey('slack.emergency')
    const regexpForContents = new RegExp(`${content.join("|")}`, "i")

    if (channel.includes(this.eventChannel) || people.includes(this.eventSubtitle) || regexpForContents.test(this.eventContent)) {
      return true
    }

    return false
  }
}