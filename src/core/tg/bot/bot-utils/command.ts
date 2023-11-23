import appConfig from "@config/app-config"
import { log } from "@logger/logger"
import { BotTelegram } from "@tg/bot/bot-telegram"
import * as TgText from "@tg/bot/bot-utils/out/text"
import * as TgKeyboard from "@tg/bot/bot-utils/out/inline-keyboards"
import { AlertContainer } from "@core/alert/alert-container"
import { getSlackHandshake, getSlackStatus } from "@core/slack/slack-middleware"
import { start as serverStart, stop as serverStop } from "@core/server"
import { ZendeskUsers } from "@core/ticket/zendesk-users"
import * as VatsApi from "@core/vats/vats-api"
import { UpdateMessage } from "@definitions/childs/telegram"
import { ZendeskTickets } from "@core/ticket/zendesk-tickets";
import { TgRequestResponse } from "@definitions/definitions-tg";
import { EventType } from "@definitions/definitions-event";
import { SlackPingPongEvent } from "@core/slack/slack";

const prefix = "[telegram][command]"
let isServerStarted: boolean = false

const setupCommands = (bot: BotTelegram, alertContainer: AlertContainer, zendeskUsers: ZendeskUsers, tickets: ZendeskTickets) => {
    bot.command("start", (message: UpdateMessage) => {
        log(`${prefix} Get Command "start"`)

        if (isServerStarted) {
            log(`${prefix} Server already has been started. Nothing to do`)
            bot.deleteMessage(message.message_id)
            return
        }

        isServerStarted = true
        const zendeskAlert = appConfig.getKey('alert.zendesk_alerting')
        const slackAlert = appConfig.getKey('alert.slack_alerting')

        if (!zendeskAlert && !slackAlert) {
            log(`${prefix} All alert event is off. Start impossible`)
            bot.deleteMessage(message.message_id)
                .then(() => {
                    bot.editMainMessage(`${TgText.mainMessage()}\n${TgText.allAlertsOffMessage()}`)
                })
            return
        }

        bot.editMainMessage(TgText.mainMessage())
            .then(() => {
                bot.deleteMessage(message.message_id)
                const slackPingPongSendMessage = () => {
                    bot.sendMessage(
                        TgText.slackPingPongMessage(),
                        TgKeyboard.onlyAckAlert('Ack')
                    ).then((res: TgRequestResponse) => {
                        const messageId = res.result.message_id
                        alertContainer.addEvent(EventType.SlackPingPong, new SlackPingPongEvent(messageId), messageId)
                    })
                }

                serverStart(alertContainer, bot, zendeskUsers, tickets, slackPingPongSendMessage)
                return bot.sendMessage(TgText.slackScriptMessage(), TgKeyboard.deleteMessageKeyboard("🆗 Удалить"))
            })
    })

    bot.command("stop", (message: UpdateMessage) => {
        log(`${prefix} Get Command "stop"`)
        bot.deleteMessage(message.message_id).then(() => {
            serverStop(alertContainer)
            bot.sendMessage(TgText.stopMessage())
        })
    })

    bot.command("status", (message: UpdateMessage) => {
        log(`${prefix} Get Command "status"`)
        bot.deleteMessage(message.message_id).then(async () => {
            const mobile = <string>appConfig.getKey("vats.telnum.real")
            const vatsUser = await VatsApi.getUser()

            const slackHandshake = getSlackHandshake()
            const slackLastPingPong = getSlackStatus()
            const vatsConnected = !!vatsUser.message
            const userIsCorrected = vatsUser.mobile_redirect.enabled && vatsUser.mobile_redirect.forward && vatsUser.mobile === mobile
            const lastSuccessTicketsRequest = (tickets.lastSuccessTicketsRequest)
                ? Date.now() - tickets.lastSuccessTicketsRequest
                : 0

            bot.sendMessage(
                TgText.statusMessage(slackHandshake, slackLastPingPong, vatsConnected, userIsCorrected, lastSuccessTicketsRequest),
                TgKeyboard.deleteMessageKeyboard("🆗 Удалить")
            )
        })
    })

    bot.command("zendesk", (message: UpdateMessage) => {
        log(`${prefix} Get Command "zendesk"`)
        const zendeskAlert = appConfig.getKey('alert.zendesk_alerting')
        appConfig.setKeyWithSave('alert.zendesk_alerting', !zendeskAlert)

        bot.deleteMessage(message.message_id).then(() => {
            bot.editMainMessage(TgText.mainMessage())
        })
    })

    bot.command("slack", (message: UpdateMessage) => {
        log(`${prefix} Get Command "slack"`)
        const slackAlert = appConfig.getKey('alert.slack_alerting')
        appConfig.setKeyWithSave('alert.slack_alerting', !slackAlert)

        bot.deleteMessage(message.message_id).then(() => {
            bot.editMainMessage(TgText.mainMessage())
        })
    })

    bot.command("zendesk_work_type", (message: UpdateMessage) => {
        log(`${prefix} Get Command "zendesk_work_type"`)
        const zendeskAlert = <boolean>appConfig.getKey('alert.zendesk_alerting')

        if (zendeskAlert) {
            bot.sendMessage(TgText.zendeskAlertTypeOnMessage(), TgKeyboard.zendeskAlertTypeKeyboard())
        } else {
            bot.editMainMessage(`${TgText.mainMessage()}\n${TgText.zendeskAlertTypeOffMessage()}`)
        }

        bot.deleteMessage(message.message_id).then(() => {
            bot.editMainMessage(TgText.mainMessage())
        })
    })

    bot.command("notifications_type", (message: UpdateMessage) => {
        log(`${prefix} Get Command "notifications_type"`)

        bot.deleteMessage(message.message_id).then(() => {
            bot.sendMessage(TgText.notificationTypeMessage(), TgKeyboard.notificationTypeKeyboard())
        })
    })
}

export { setupCommands }