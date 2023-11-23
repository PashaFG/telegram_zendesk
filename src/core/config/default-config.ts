import { Config, PushType, ZendeskAlertingType } from '@definitions/definitions-config'

export const defaultConfig: Config = {
  telegram: {
    chat_id: 0,
    bot_token: "",
  },
  server_port: 3002,
  alert: {
    type: PushType.Call, // push (only push) / call (push and call)
    zendesk_alerting: true,
    zendesk_alerting_type: ZendeskAlertingType.Default, // default/user/group
    slack_alerting: true,
    time: {
      normal: 600000, // ms
      emergency: 300000, // ms
    },
  },
  logger: {
    path: "logs/",
    fileSize: 10,
    dirSize: 256,
  },
  vats: {
    key: "",
    domain: "",
    user: "",
    telnum: {
      real: "",
      fake: "",
    },
  },
  zendesk: {
    domain: "",
    view_url: "",
    users_url: "",
    default_group_id: "",
    user: {
      id: 0,
      name: "",
    },
    shared_session: "",
  },
  slack: {
    ws_link: "",
    emergency: {
      channel: [],
      people: [],
      content: [],
    },
  },
}