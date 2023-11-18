import { AlertContainer } from "@/core/alert/alert-container"
import { BotTelegram } from "@tg/bot/bot-telegram"
import { log } from "@logger/logger";
import { Update } from "@definitions/definitions-tg";

const prefix = "[telegram]";

const setupActions = (bot: BotTelegram, alertContainer: AlertContainer) => {
    bot.action("ack", (event: Update) => {
        const id = event.message.message_id
        log(`${prefix} ack ${id}`)

        const alert = alertContainer.items.find(alert => alert.body.id === id)

        bot.deleteMessage(alert.body.id)
        alertContainer.removeAlert(alert.body.id)

        log(`${prefix} Removed: alert ${alert.body.id}, message: ${id}`)
        log(`${prefix} Amount alerts after removed: ${alertContainer.length}`)
    })
}

export { setupActions }