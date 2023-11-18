import 'module-alias/register';
import { AlertContainer } from '@core/alert/alert-container';
import logger, { log } from '@/core/logger/logger';
import Bot from '@core/tg/bot'
import appConfig from '@config/app-config';
import { printScript } from "@lib/browser-script";
import { ZendeskUsers } from "@core/ticket/zendesk-users";
import { sleep } from "@lib/utils";

(async () => {
    logger.log('Start application')
    appConfig.readConfig('./app_config.json')
    const zendeskUsersUrl = <string>appConfig.getKey('zendesk.users_url')
    const zendeskSession = <string>appConfig.getKey('zendesk.shared_session')

    const zendeskUsers = new ZendeskUsers(zendeskUsersUrl, zendeskSession)
    const alertContainer = new AlertContainer()
    await zendeskUsers.fetchUsers()

    while (!zendeskUsers.length) {
        log(`Error parse users. Second try after 5 seconds`)
        console.log("Error parse users from zendesk. Second try after 5 seconds. Look details on log file")
        await sleep(5000)
        await zendeskUsers.fetchUsers()
    }

    Bot.start(alertContainer, zendeskUsers)
    printScript( < string > appConfig.getKey('slack.ws_link'), <number>appConfig.getKey('server_port'))
})()

