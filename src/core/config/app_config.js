// @ts-nocheck
import fs from 'fs'

let appConfig = {
  bot_token: "",
  server_port: 3002,
  alert: {
    type: "push", // push (only push) / call (push and call)
    zendesk_alerting: true,
    zendesk_alerting_type: "default", // default/user/group
    slack_alerting: true,
    time: {
      normal: 600000,
      emergency: 300000
    }
  },
  vats: {
    key: "",
    domain: "",
    user: "",
    telnum: {
      real: "",
      fake: ""
    },
  },
  zendesk: {
    domain: "",
    view_url: "",
    organization_id: "",
    default_group_id: "",
    user: "",
    shared_session: "",
  },
  slack: {
    ws_link: "",
    emergency: {
      channel: [],
      people: [],
      content: []
    }
  },
}
let pathToFile

const readConfig = (fullFileName) => {
  pathToFile = fullFileName
  const existConfig = fs.existsSync(pathToFile)
  if (!existConfig) {
    fs.appendFileSync(pathToFile, JSON.stringify(appConfig))
  }
  const defaultConfig = JSON.parse(fs.readFileSync(pathToFile, { encoding: 'utf8', flag: 'rs+' }))
  try {
    appConfig = {
      ...defaultConfig,
    }
    appConfig.server_port = process.env.SERVER_PORT
    appConfig.bot_token = process.env.BOT_TOKEN
    appConfig.vats.key = process.env.VATS_KEY
    appConfig.zendesk.shared_session = process.env.ZENDESK_SHARED_SESSION
    appConfig.slack.ws_link = process.env.SLACK_WS

    if (appConfig.zendesk.view_url && !appConfig.zendesk.domain) {
      appConfig.zendesk.domain = appConfig.zendesk.view_url.match(/\w+\.zendesk.com/gm)[0]
      saveConfig()
    }

    if (!existConfig) {
      saveConfig()
    }
  } catch (e) {
    console.log(`Error to copy .env to config:\n${String(e)}`)
  }
}

const saveConfig = () => {
  fs.writeFileSync(pathToFile, JSON.stringify(appConfig))
  readConfig()
}

const getFullConfig = () => {
  return appConfig
}

const getKey = (key) => {
  let value = appConfig

  key.split(".").forEach((parentKey) => {
    value = value[parentKey]
  })

  return value
}

const setKey = (key, value) => {
  let timeValue = appConfig
  const array = key.split(".")
  const lastKey = array.pop()

  for (let i = 0; i < array.length; i++) {
    timeValue = timeValue[array[i]]
  }

  timeValue[lastKey] = value
}
// TODO finally after every element get ready and config example has final form
const checkConfig = () => {
  if (
    appConfig
  ) {
    return true
  } else {
    return false
  }
}

export default {
  readConfig,
  saveConfig,
  getFullConfig,
  getKey,
  setKey,
  checkConfig
}