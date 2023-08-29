// @ts-nocheck
// { "type": "desktop_notification", "title": "ITooLabs", "subtitle": "mamkin", "msg": "1691073671.182109", "ts": "1691073671.182109", "content": "пишу в слак", "channel": "D02NH4ZJPS4", "launchUri": "slack://channel?id=D02NH4ZJPS4&message=1691073671182109&team=T033Y1Z3U", "avatarImage": "https://avatars.slack-edge.com/2020-09-16/1372970130164_f582f4d99319972f3b15_192.png", "ssbFilename": "knock_brush.mp3", "imageUri": null, "is_shared": false, "is_channel_invite": false, "event_ts": "1691073672.016200" }

// {"type":"desktop_notification","title":"ITooLabs","subtitle":"#support_zendesk","msg":"1691078766.110819","ts":"1691078766.110819","content":"zendesk (bot): Ticket requires attention - *`no replay 1h`* Status: Открыт [`Westcall SPB`][#161600] - \"Запрос от клиента домен alyansltd.westcall.cloud\"","channel":"CG91F4N58","launchUri":"slack://channel?id=CG91F4N58&message=1691078766110819&team=T033Y1Z3U","avatarImage":"","ssbFilename":"knock_brush.mp3","imageUri":null,"is_shared":false,"is_channel_invite":false,"event_ts":"1691078767.017000"}

// { "type": "desktop_notification", "title": "ITooLabs", "subtitle": "support-team", "msg": "1691078370.349109", "ts": "1691078370.349109", "content": "leeloush_keer: отбегу еще перекусить быстренько", "channel": "G3KT6FEBC", "launchUri": "slack://channel?id=G3KT6FEBC&message=1691078370349109&team=T033Y1Z3U", "avatarImage": "https://avatars.slack-edge.com/2017-07-26/217106806272_b5bac3bdccc6262e9464_192.png", "ssbFilename": "knock_brush.mp3", "imageUri": null, "is_shared": false, "is_channel_invite": false, "event_ts": "1691078371.016900" }

import appConfig from '#core/config/app_config.js'


export class SlackEvent {
  constructor(data) {
    this.id = Math.floor(Number(data.event_ts) * 1000000)
    this.eventContent = data.content
    this.eventChannel = data.channel
    this.eventSubtitle = data.subtitle
    this.isEmergency = this.#checkEmergency()
  }

  #checkEmergency() {
    const { channel, people, content } = appConfig.getKey('slack.emergency')
    const regexpForContents = new RegExp(`${content.join("|")}`, "i")

    if (channel.includes(this.eventChannel) || people.includes(this.eventSubtitle) || regexpForContents.test(this.eventContent)) {
      return true
    }

    return false
  }
}