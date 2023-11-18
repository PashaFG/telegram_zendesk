import { TgMenuButtons, TgReplyMarkup, UpdateMessage, UpdateCallbackQuery, UpdateChosenInlineResult, UpdateInlineQuery } from "./childs/telegram"

export type TgCallbackFunction = (data: Update[]) => void
export type ReplyMarkup = TgReplyMarkup

export interface TgResponse {
    ok: boolean,
    result?: Update[]
}

export interface TgRequestResponse {
    ok: boolean,
    result: {
        message_id: number,
        from: {
            id: number,
            is_bot: boolean,
            first_name: string,
            username: string
        }
        chat: {
            id: number,
            first_name: string,
            username: string,
            type: string
        },
        date: number,
        text: string
    },
}

export interface TgMessageLocalData {
  chatId: number
  text?: string
  messageId?: number
  reply_markup?: ReplyMarkup | TgBotMenu
}
export interface TgMessageOutData {
  chat_id: number
  text?: string
  message_id?: number
  parse_mode?: string
  reply_markup?: ReplyMarkup
}

export interface TgListeners {
  commands: {
    [key: string]: (event: UpdateMessage) => void
  }
  actions: {
    [key: string]: (event: UpdateCallbackQuery) => void
  }
  messages: {
    [key: string]: (event: UpdateMessage) => void
  } 
}
export interface TgConfig {
  token: string
  delay: number
  menuButtons: TgMenuButtons
}
export interface TgBotMenu {
  keyboard: TgMenuButtons
  is_persistent: boolean
  resize_keyboard: true
  input_field_placeholder: "menu"
}

export interface Update {
  update_id: number,
  message?: UpdateMessage,
  edited_message?: UpdateMessage,
  channel_post?: UpdateMessage,
  edited_channel_post?: UpdateMessage,
  inline_query?: UpdateInlineQuery,
  chosen_inline_result?: UpdateChosenInlineResult,
  callback_query: UpdateCallbackQuery,
}