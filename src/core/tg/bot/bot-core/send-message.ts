import {
    TgMessageLocalData,
    TgMessageOutData,
    TgResponse,
    ReplyMarkup
} from "@definitions/definitions-tg"

const verifyResponse = (response: TgResponse) => {
    if (response.ok) {
        return response
    } else {
        console.log(response)
        return false
    }
}

const fetchResponseToTelegram = (url: string, data: TgMessageOutData) => {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(verifyResponse)
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
