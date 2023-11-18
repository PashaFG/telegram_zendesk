import { formattingMsg, capitalize } from "@lib/formate-message";
import { PushType, ZendeskAlertingType } from "@definitions/definitions-config";
import appConfig from "@config/app-config";
import { script } from "@lib/browser-script";

function code (message: string[] | string) {
    if (Array.isArray(message)) return ['```', ...message, '```']

    return ['```', message, '```']
}

function prepare(message: string[]) {
    return message.map(el => formattingMsg(el)).join("\n")
}


export function setupMenuMessage() {
    return prepare([
        '👀 Принял смену! 👀',
        'Можешь заниматься своими делами, я присмотрю 💻',
    ])
}

export function mainMessage() {
    const alertType = <PushType>appConfig.getKey("alert.type")
    const telnum = <string>appConfig.getKey("vats.telnum.real")
    const zendeskAlert = <boolean>appConfig.getKey('alert.zendesk_alerting')
    const checkType = <ZendeskAlertingType>appConfig.getKey('alert.zendesk_alerting_type')
    const slackAlert = <boolean>appConfig.getKey('alert.slack_alerting')
    const zendeskUser = <string>appConfig.getKey('zendesk.user.name')

    const text = [`Тип оповещения: ${ alertType === "call" ? "Со звонками" : "Только уведомления" }`]
    if (alertType === "call") text.push(`Номер для оповещения: ${ telnum }`)
    text.push(`Оповещения из Slack: ${ slackAlert ? "Включены" : "Отключены" }`)
    text.push(`Оповещения из Zendesk: ${ zendeskAlert ? "Включены" : "Отключены" }`)
    if (zendeskAlert) text.push(`Тип проверки тикетов: ${ capitalize(checkType) }`)
    if (checkType === "user") text.push(`Выбранный сотрудник: ${ (zendeskUser) ? zendeskUser : "Не указан" }`)

    return [
        formattingMsg('Текущие настройки оповещения:'),
        ...code(text.map(el => formattingMsg(el))),
        `${formattingMsg('Если настройки корректны, жми ')}\`${formattingMsg('/start')}\` ${formattingMsg('и я начну работу')}`,
    ].join("\n")
}

export function slackScriptMessage() {
    const wsLink = <string>appConfig.getKey('slack.ws_link')
    const port = <number>appConfig.getKey('server_port')

    return [
        formattingMsg('Скрипт для вставки в консоль браузера во вкладку со Slack'),
        ...code(script(wsLink, port)),
    ].join("\n")
}

export function allAlertsOffMessage() {
    return [
        formattingMsg('❌ Все типы нотификации выключены! ❌'),
        `${formattingMsg('Включите нотификацию для Slack или Zendesk и жми ')}\`${formattingMsg('/start')}\``,
    ].join("\n")
}

export function zendeskAlertTypeOnMessage() {
    return prepare([
        'Выберите тип работы оповещений из zendesk',
        'default - нотификации по любым изменения, без игнорирования',
        'user - игнорируются изменения в тикетах выбранного сотрудника',
        'group - игнорируются изменения при взятия обращения',
    ])
}

export function zendeskAlertTypeOffMessage() {
    return [
        formattingMsg('❌ Нотификации для Zendesk выключены! ❌'),
        `${formattingMsg('Включите нотификацию Zendesk по клавише ')}\`${formattingMsg('/zendesk')}\``,
    ].join("\n")
}

export function notificationTypeMessage() {
    return prepare([
        'Необходимо выбрать тип оповещений',
        'push - Только уведомления',
        'push - Со звонками',
    ])
}

export function chooseUserMessage(){
    return prepare([
        'Не выбран сотрудник в Zendesk, но при этом установлен тип нотификации "user"',
        'Перед тем как продолжить необходимо выбрать сотрудника из списка:',
    ])
}

export function stopMessage() {
    return prepare([
        '🚶Закончил работу!🚶',
        'Раз пока я больше не нужен, то пошел выключать все',
    ])
}