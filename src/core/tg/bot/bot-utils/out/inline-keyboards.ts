import { ReplyMarkup } from "@definitions/definitions-tg";
import { TicketUsers } from "@definitions/definitions-zendesk";
import { Ticket } from "@core/ticket/ticket";

export function deleteMessageKeyboard(text: string): ReplyMarkup {
    return {
        inline_keyboard: [[{ text, callback_data: 'delete_message' }]],
    }
}

export function onlyAckAlert(text: string): ReplyMarkup {
    return {
        inline_keyboard: [[{ text, callback_data: 'ack' }]],
    }
}

export function zendeskAlertTypeKeyboard(): ReplyMarkup {
    return {
        inline_keyboard: [
            [
                { text: "default", callback_data: 'zendesk_alert_default' },
                { text: "user", callback_data: 'zendesk_alert_user' },
                { text: "group", callback_data: 'zendesk_alert_group' },
            ],
        ],
    }
}

export function notificationTypeKeyboard(): ReplyMarkup {
    return {
        inline_keyboard: [
            [
                { text: "push", callback_data: 'notification_push' },
                { text: "call", callback_data: 'notification_call' },
            ],
        ],
    }
}

export function chooseUserKeyboard(users: TicketUsers[][]): ReplyMarkup {
    return {
        inline_keyboard: users.map(row => row.map(el => ({ text: el.name, callback_data: `zendesk_user_${el.id}` }))),
    }
}

export function ticketKeyboard(ticket: Ticket): ReplyMarkup {
    return {
        inline_keyboard: [
            [{ text: `Перейти к #${ticket.id}`, url: ticket.link }],
            [{ text: "✅ Ack", callback_data: 'ack' },{ text: "✅ Ack All ✅", callback_data: 'ack_all' }],
        ],
    }
}

export function slackKeyboard(): ReplyMarkup {
    return {
        inline_keyboard: [[{ text: "✅ Ack", callback_data: 'ack' },{ text: "✅ Ack All ✅", callback_data: 'ack_all' }]],
    }
}