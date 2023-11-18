import {
    TgMessageLocalData,
    TgMessageOutData,
    ReplyMarkup,
} from "@definitions/definitions-tg"


const fetchResponseToTelegram = async (url: string, data: TgMessageOutData) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

const send = (url: string, data: TgMessageLocalData) => {
    const fullUrl = url + "/sendMessage"
    const bodyData: TgMessageOutData = {
        chat_id: data.chatId,
        text: data.text,
        parse_mode: "MarkdownV2",
    }

    if (data.reply_markup) {
        bodyData.reply_markup = <ReplyMarkup>data.reply_markup
    }

    return fetchResponseToTelegram(fullUrl, bodyData)
}

const edit = (url: string, data: TgMessageLocalData) => {
    const fullUrl = url + "/editMessageText"

    const bodyData: TgMessageOutData = {
        chat_id: data.chatId,
        message_id: data.messageId,
        text: data.text,
        parse_mode: "MarkdownV2",
    }

    if (data.reply_markup) {
        bodyData.reply_markup = <ReplyMarkup>data.reply_markup
    }

    return fetchResponseToTelegram(fullUrl, bodyData)
}

const del = (url: string, data: TgMessageLocalData) => {
    const fullUrl = url + "/deleteMessage"

    const bodyData: TgMessageOutData = {
        chat_id: data.chatId,
        message_id: data.messageId,
    }

    return fetchResponseToTelegram(fullUrl, bodyData)
}

export { send, edit, del }
