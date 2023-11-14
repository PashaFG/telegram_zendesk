import fs from 'fs'
import { Config, ValueConfigType } from '@definitions/definitions-config'
import { defaultConfig } from './default-config'
import { log } from "@logger/logger"
import dotenv from 'dotenv'
dotenv.config()

const prefix = "[config]"

let appConfig: Config = defaultConfig
let pathToFile: string

const readConfig = (fullFileName?) => {
  log(`${prefix} Start reading config`)
  if (fullFileName) { pathToFile = fullFileName }
  if (!pathToFile) { pathToFile = './app_config.json' }

  const existConfig = fs.existsSync(pathToFile)
  if (!existConfig) {
    fs.appendFileSync(pathToFile, JSON.stringify(appConfig))
  }
  const _defaultConfig: Config = JSON.parse(fs.readFileSync(pathToFile, { encoding: 'utf8', flag: 'rs+' }))
  try {
    appConfig = _defaultConfig

    if (appConfig.zendesk.view_url && !appConfig.zendesk.domain) {
      appConfig.zendesk.domain = appConfig.zendesk.view_url.match(/\w+\.zendesk.com/gm)[0]
      saveConfig()
    }

    if (!existConfig) {
      log(`${prefix} Create config file`)
      saveConfig()
    }
  } catch (e) {
    log(`${prefix} ${String(e)}`)
  }
}

const saveConfig = () => {
  try {
    fs.writeFileSync(pathToFile, JSON.stringify(appConfig))
    readConfig()
  } catch (error) {
    log(`${prefix} ${String(error)}`)
  }
}

const getFullConfig = () => {
  return appConfig
}

const getKey = (key: string): ValueConfigType => {
  let value: ValueConfigType = structuredClone(appConfig)

  key.split(".").forEach((parentKey) => {
    value = value[parentKey]
  })

  return value
}

const setKey = (key: string, value: ValueConfigType) => {
  log(`${prefix} Save key to config: ${key} = ${JSON.stringify(value)}`)

  let timeValue = appConfig
  const array = key.split(".")
  const lastKey = array.pop()

  for (let i = 0; i < array.length; i++) {
    timeValue = timeValue[array[i]]
  }
  timeValue[lastKey] = value
}

const setKeyWithSave = (key: string, value: ValueConfigType) => {
  setKey(key, value)

  saveConfig()
  readConfig()
}

/* TODO 
 * finally after every element get ready and config example has final form 
 * need to release check every key to normal/real value
 * 
 * example:
 * domain mast be domain.com and answer on ping
 * vats mast have all key and normal answer on some REST API requests
 * etc...
*/ 
const checkConfig = () => {
  log(`${prefix} Checking config`)

  if (
    appConfig.bot_token &&
    appConfig.vats.key &&
    appConfig.vats.domain &&
    appConfig.vats.user &&
    appConfig.vats.telnum.real &&
    appConfig.vats.telnum.fake &&
    appConfig.zendesk.domain &&
    appConfig.zendesk.view_url &&
    appConfig.zendesk.shared_session &&
    appConfig.slack.ws_link
  ) {
    log(`${prefix} ERROR: some parts in config is not correct`)

    return true
  }
  log(`${prefix} Checking is successful. Config is correct.`)

  return false
}

const envToJson = () => {
  readConfig()

  setKey('bot_token', process.env.BOT_TOKEN)
  setKey('server_port', Number(process.env.SERVER_PORT))
  setKey('alert.time.normal', Number(process.env.ALERT_TIME))
  setKey('alert.time.emergency', Number(process.env.ALERT_TIME_EMERGENCY))

  setKey('vats.key', process.env.VATS_KEY)
  setKey('vats.domain', process.env.VATS_DOMAIN)
  setKey('vats.user', process.env.VATS_USER)
  setKey('vats.telnum.real', process.env.VATS_TELNUM)
  setKey('vats.telnum.fake', process.env.VATS_FAKE_TELNUM)

  setKey('logger.path', process.env.LOGGER_PATH_TO_DIRECTORY)
  setKey('logger.fileSize', process.env.LOGGER_SIZE_LIMIT_FILE)
  setKey('logger.dirSize', process.env.LOGGER_SIZE_LIMIT_DIRECTORY)

  setKey('zendesk.domain', process.env.ZENDESK_DOMAIN)
  setKey('zendesk.view_url', process.env.ZENDESK_URL)
  if (process.env.ZENDSEK_DEFAULT_GROUP_ID) {
      setKey('zendesk.default_group_id', process.env.ZENDSEK_DEFAULT_GROUP_ID)
      setKey(
        'zendesk.users_url',
        `https://${process.env.ZENDESK_DOMAIN}/api/v2/groups/${process.env.ZENDSEK_DEFAULT_GROUP_ID}/users?role=agent`
      )
  }
  setKey('zendesk.shared_session', process.env.ZENDESK_SHARED_SESSION)

  setKey('slack.ws_link', process.env.SLACK_WS)
  setKey('slack.emergency.channel', process.env.EMERGENCY_CHANNEL?.split(","))
  setKey('slack.emergency.people', process.env.EMERGENCY_PEOPLE?.split(","))
  setKey('slack.emergency.content', process.env.EMERGENCY_CONTENT?.split(","))

  saveConfig()
  readConfig()
}

export default {
  readConfig,
  saveConfig,
  getFullConfig,
  getKey,
  setKey,
  setKeyWithSave,
  checkConfig,
  envToJson
}