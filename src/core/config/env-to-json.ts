import 'module-alias/register'
import app_config from "./app-config"
import { log } from "@logger/logger"

const prefix = "[config]"

log(`${prefix} Start reading and creating config`)

app_config.envToJson()

log(`${prefix} Setup config. Look "./app_config.json" in root dir. Please fill the blank space`)