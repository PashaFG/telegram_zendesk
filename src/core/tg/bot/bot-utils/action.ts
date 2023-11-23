import { AlertContainer } from "@/core/alert/alert-container"
import { BotTelegram } from "@tg/bot/bot-telegram"
import { log } from "@logger/logger"
import { UpdateCallbackQuery } from "@definitions/childs/telegram"
import * as TgText from "@tg/bot/bot-utils/out/text"
import * as TgKeyboard from "@tg/bot/bot-utils/out/inline-keyboards"
import appConfig from "@config/app-config"
import { ZendeskUsers } from "@core/ticket/zendesk-users"
import { ZendeskAlertingType } from "@definitions/definitions-config";

const prefix = "[telegram]"

const setupActions = (bot: BotTelegram, alertContainer: AlertContainer, zendeskUsers: ZendeskUsers) => {
    bot.action("delete_message", (ctx: UpdateCallbackQuery) => {
        log(`${prefix} Get Action "delete_message"`)
        bot.deleteMessage(ctx.message.message_id)
    })

    bot.action("ack", (ctx: UpdateCallbackQuery) => {
        const id = ctx.message.message_id
        log(`${prefix} Get Action "ack"`)
        log(`${prefix} ack ${id}`)

        const alert = alertContainer.items.find(alert => alert.tgMessageId === id)

        bot.deleteMessage(id).then(() => {
            alertContainer.removeAlert(alert.body.id)

            log(`${prefix} Removed: alert ${alert.body.id}, message: ${id}`)
            log(`${prefix} Amount alerts after removed: ${alertContainer.length}`)
        })
    })

    bot.action("ack_all", (ctx: UpdateCallbackQuery) => {
        log(`${prefix} Get Action "ack_all" from message: ${ctx.message.message_id}`)
        alertContainer.items.forEach((alert) => {
            bot.deleteMessage(alert.tgMessageId)
        })

        alertContainer.clearAllAlerts()
    })

    bot.action("zendesk_alert_default", (ctx: UpdateCallbackQuery) => {
        log(`${prefix} Get Action "zendesk_alert_default"`)
        appConfig.setKeyWithSave('alert.zendesk_alerting_type', ZendeskAlertingType.Default)

        bot.editMainMessage(TgText.mainMessage()).then(() => {
            bot.deleteMessage(ctx.message.message_id)
        })
    })

    bot.action("zendesk_alert_user", async (ctx: UpdateCallbackQuery) => {
        log(`${prefix} Get Action "zendesk_alert_user"`)
        appConfig.setKeyWithSave('alert.zendesk_alerting_type', ZendeskAlertingType.User)
        const zendeskUser = <number>appConfig.getKey('zendesk.user.id')

        if (!zendeskUser) {
            bot.editMessage(
                ctx.message.message_id,
                TgText.chooseUserMessage(),
                TgKeyboard.chooseUserKeyboard(zendeskUsers.usersToColumn)
            )

            return
        }

        bot.editMainMessage(TgText.mainMessage()).then(() => {
            bot.deleteMessage(ctx.message.message_id)
        })
    })

    bot.action("zendesk_alert_group", (ctx: UpdateCallbackQuery) => {
        log(`${prefix} Get Action "zendesk_alert_group"`)
        appConfig.setKeyWithSave('alert.zendesk_alerting_type', ZendeskAlertingType.Group)

        bot.editMainMessage(TgText.mainMessage()).then(() => {
            bot.deleteMessage(ctx.message.message_id)
        })
    })

    bot.action("notification_push", (ctx: UpdateCallbackQuery) => {
        log(`${prefix} Get Action "notification_push"`)
        appConfig.setKeyWithSave('alert.type', "push")

        bot.editMainMessage(TgText.mainMessage()).then(() => {
            bot.deleteMessage(ctx.message.message_id)
        })
    })

    bot.action("notification_call", (ctx: UpdateCallbackQuery) => {
        log(`${prefix} Get Action "notification_call"`)
        appConfig.setKeyWithSave('alert.type', "call")

        bot.editMainMessage(TgText.mainMessage()).then(() => {
            bot.deleteMessage(ctx.message.message_id)
        })
    })

    zendeskUsers.users.forEach((user) => {
        bot.action(`zendesk_user_${user.id}`, (ctx: UpdateCallbackQuery) => {
            appConfig.setKey('zendesk.user.id', user.id)
            appConfig.setKeyWithSave('zendesk.user.name', user.name)

            bot.editMainMessage(TgText.mainMessage()).then(() => {
                bot.deleteMessage(ctx.message.message_id)
            })
        })
    })
}

export { setupActions }