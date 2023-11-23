import 'module-alias/register';
import { AlertContainer } from '@core/alert/alert-container';
import logger, { log } from '@/core/logger/logger';
import Bot from '@core/tg/bot'
import appConfig from '@config/app-config';
import { printScript } from "@lib/browser-script";
import { ZendeskUsers } from "@core/ticket/zendesk-users";
import { sleep } from "@lib/utils";
import { ZendeskTickets } from "@core/ticket/zendesk-tickets";

/** @todo
 * - Доделать отправку оповеений по тикетам
 * - Доделать отправку оповещений из Слака
 * - Доделать отправку оповещения если вкладка в браузере со слаком выгрузилась из браузера
 * - Добавить возможность получать все уведомления из слака или только эмерженси
 * - Добавить /pause <number> который будет на указанное кол-во секунд паузить нотификации по осбытиям, кроме эмерженси событий
 * - Добавить /pause <number> all который будет на указанное кол-во секунд паузить все типы ноти нотификаций
 * - Дописать логику start() и config() для логгера
 *      - start() - запускает инстанс логера. так как сейчас запуск происходит при импорте самого логера (что может привести к нескольких записям при невнимательности)
 *      - config() - конфигурирует сам логер, его поведение, уровни логирование, лимиты директории (по размеру), лимит файла error.log, лимит размера одного файла (по размеру, по занимаемой памяти)
 * - Доделать логику в zendesk-ticket.ts
 *      - Вынести однотипные проверки в отдельные приватный метод, для лучшей читабельности
 *      - Добавить в рамках данного метода игнорирование если единственное изменение - это добавление тега "no replay 1h"
 *      - так же добавить игнорирование тригера на "no reply 1h" в эвенты слака для данного тикета
 *        возможно данную фичу стоит делать выключаймое из tg, либо отключать только для типа нотификации со звонками, чисто для пуш уведомелний - это не критично
 *        (возможно хорошим решением будет добавить поле no_reply_1h: boolean в класс Ticket)
 *      - Добавить оповещение если до конца SLA осталось N времени (пускай задается одним из параметров конфига)
 * - Написать оверлооды длля appConfgi.getKey() для определения возвращаемого типа и убрать захардкоженные типы
 */

(async () => {
    logger.log('Start application')
    appConfig.readConfig('./app_config.json')
    const zendeskUsersUrl = <string>appConfig.getKey('zendesk.users_url')
    const zendeskSession = <string>appConfig.getKey('zendesk.shared_session')
    const zendeskViewUrl = <string>appConfig.getKey('zendesk.view_url')

    const tickets = new ZendeskTickets(zendeskViewUrl, zendeskSession)
    const zendeskUsers = new ZendeskUsers(zendeskUsersUrl, zendeskSession)
    const alertContainer = new AlertContainer()
    await zendeskUsers.fetchUsers()

    while (!zendeskUsers.length) {
        log(`Error parse users. Second try after 5 seconds`)
        console.log("Error parse users from zendesk. Second try after 5 seconds. Look details on log file")
        await sleep(5000)
        await zendeskUsers.fetchUsers()
    }

    Bot.start(alertContainer, zendeskUsers, tickets)
    printScript( < string > appConfig.getKey('slack.ws_link'), <number>appConfig.getKey('server_port'))
})()

