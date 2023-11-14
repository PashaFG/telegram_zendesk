import { TgMenuButtons, ReplyMarkup, UpdateMessage, UpdateCallbackQuery, UpdateChosenInlineResult, UpdateInlineQuery} from "./childs/telegram"

export type TgCallbackFunction = (data: Update[]) => void

export interface TgResponse {
    ok: boolean,
    result?: Update[]
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
    [key: string]: (event: any) => {}
  }
  actions: {
    [key: string]: (event: any) => {}
  }
  messages: {
    [key: string]: (event: any) => {}
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