import 'module-alias/register';
import { start as serverStart } from '@core/server'
import { AlertContainer } from '@core/alert/alert-container';
import logger from '@/core/logger/logger';
import Bot from '@core/tg/bot'
import appConfig from '@config/app-config';

logger.log('Start application')
appConfig.readConfig('./app_config.json')

const alertContainer = new AlertContainer()
const bot = Bot.start(alertContainer)
serverStart(alertContainer)