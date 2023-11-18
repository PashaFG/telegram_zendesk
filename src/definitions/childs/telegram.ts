interface User { 
  id: number,
  is_bot: boolean,
  first_name: string,
  last_name: string,
  username: string,
  language_code: string,
  is_premium: boolean,
  added_to_attachment_menu: boolean,
}

interface Chat {
  id: number,
  type: string,
  title: string,
  username: string,
  first_name: string,
  last_name: string
  is_forum: boolean,
  active_usernames: string[]
  emoji_status_custom_emoji_id: string,
  emoji_status_expiration_date: number,
  bio: string,
  has_private_forwards: boolean,
  has_restricted_voice_and_video_messages: boolean,
  join_to_send_messages: boolean,
  join_by_request: boolean,
  description: string,
  invite_link: string,
  pinned_message: UpdateMessage,
  pinned_message_date: number
}

export type TgMenuButtons = { text: string }[][]
export interface TgKeyboardBuutton {
  text: string
  url?: string
  callback_data?: string
}
export interface TgReplyMarkup {
  inline_keyboard?: TgKeyboardBuutton[][]
  menuButtons?: TgMenuButtons
}

export interface UpdateMessageEntity {
  type: "bot_command"
}

export interface UpdateMessage {
  message_id: number,
  message_thread_id: number,
  from?: User,
  sender_chat?: Chat,
  date: number,
  chat: Chat,
  forward_from?: User,
  forward_from_chat?: Chat,
  forward_from_message_id?: number,
  forward_signature?: string,
  reply_to_message?: UpdateMessage,
  entities: UpdateMessageEntity[],
  text: string,
}

export interface UpdateInlineQuery { 
  id: string,
  from: User,
  query: string,
  offset: string,
  chat_type: string
}

export interface UpdateChosenInlineResult { 
  result_id: string,
  from: User,
  query: string,
  offset: string,
  inline_message_id?: string,
}

export interface UpdateCallbackQuery {
  id: string,
  from: User,
  message?: UpdateMessage,
  inline_message_id?: string,
  chat_instance: string,
  data?: string,
  game_short_name?: string
}