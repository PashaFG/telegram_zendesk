import { getUpdatesLoop } from "./bot_core/server.js";
import { send, edit, del } from "./bot_core/send_message.js";

export class BotTelegram {
  constructor(cfg) {
    this.apiUrl = `https://api.telegram.org/bot${cfg.token}`
    this.delay = cfg.delay
    this.listeners = {
      commands: {},
      actions: {},
      messages: {}
    }
    // TODO сделать нормальный вариант считывания chatId из конфигурации/первого сообщения в /getUpdates
    this.chatId = 429697785
    this.botMenu = {
      "keyboard": cfg.menuButtons,
      "is_persistent": true,
      "resize_keyboard": true,
      "input_field_placeholder": "menu"
    }
  }

  #toSend(data) {
    return send(this.apiUrl, data).then(response => {
      return response
    })
  }

  command(msg, callback) {
    this.listeners.commands[`/${msg}`] = callback
  }

  action(msg, callback) {
    this.listeners.actions[msg] = callback
  }

  message(msg, callback) {
    this.listeners.messages[msg] = callback
  }

  setupMenu(text) {
    return this.#toSend({
      chatId: this.chatId,
      text,
      reply_markup: this.botMenu
    })
  }

  sendMessage(text, reply_markup = {}) {
    return this.#toSend({
      chatId: this.chatId,
      text,
      reply_markup,
    })
  }

  editMessage(msg, text, reply_markup = {}) {
    return edit(this.apiUrl, {
      chatId: this.chatId,
      messageId: msg,
      text,
      reply_markup
    })
      .then(response => {
        return response
      })
  }

  deleteMessage(msg) {
    return del(this.apiUrl, {
      chatId: this.chatId,
      messageId: msg
    })
      .then(response => {
        return response
      })
  }

  start() {
    getUpdatesLoop(this.delay, this.apiUrl, (data) => {
      try {
        data.forEach(event => {
          if (event.hasOwnProperty('callback_query')) {
            this.chatId = event.callback_query.from.id

            let action = event.callback_query.data
            try {
              this.listeners.actions[action](event.callback_query)
            } catch (e) {
              console.log(`Listener for action "${action}" not found`)
            }

          } else if (event?.message?.entities && event.message.entities[0]?.type === "bot_command") {
            this.chatId = event.message.from.id

            let command = event.message.text.trim()
            try {
              this.listeners.commands[command](event.message)
            } catch (e) {
              console.log(`Listener for command "${command}" not found`)
            }

          } else {
            this.chatId = event.message.from.id

            let message = event.message.text.trim().split(' ')[0]
            try {
              this.listeners.messages[message](event.message)
            } catch (e) {
              console.log(`Listener for message "${message}" not found`)
            }
          }
        })
      } catch (e) {
        console.log(e)
      }
    })
  }
}