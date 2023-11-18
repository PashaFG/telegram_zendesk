import { getUpdatesLoop } from "./bot-core/server";
import { send, edit, del } from "./bot-core/send-message";
import { log } from "@logger/logger";
import { TgBotMenu, TgConfig, TgListeners, TgMessageLocalData, Update } from "@definitions/definitions-tg";

const prefix = "[telegram][instance]"

export class BotTelegram {
  apiUrl: string;
  delay: number;
  listeners: TgListeners;
  chatId: number;
  botMenu: TgBotMenu

  constructor(cfg: TgConfig) {
    this.apiUrl = `https://api.telegram.org/bot${cfg.token}`;
    this.delay = cfg.delay;
    this.listeners = {
      commands: {},
      actions: {},
      messages: {},
    };
    // TODO сделать нормальный вариант считывания chatId из конфигурации/первого сообщения в /getUpdates
    this.chatId = 429697785;
    this.botMenu = {
      keyboard: cfg.menuButtons,
      is_persistent: true,
      resize_keyboard: true,
      input_field_placeholder: "menu",
    };
  }

  #toSend(data: TgMessageLocalData) {
    return send(this.apiUrl, data).then((response) => {
      return response;
    });
  }

  command(msg: string, callback) {
    this.listeners.commands[`/${msg}`] = callback;
  }

  action(msg: string, callback) {
    this.listeners.actions[msg] = callback;
  }

  message(msg: string, callback) {
    this.listeners.messages[msg] = callback;
  }

  setupMenu(text) {
    return this.#toSend({
      chatId: this.chatId,
      text,
      reply_markup: this.botMenu,
    });
  }

  sendMessage(text, reply_markup = {}) {
    return this.#toSend({
      chatId: this.chatId,
      text,
      reply_markup,
    });
  }

  editMessage(msg, text, reply_markup = {}) {
    return edit(this.apiUrl, {
      chatId: this.chatId,
      messageId: msg,
      text,
      reply_markup,
    }).then((response) => {
      return response;
    });
  }

  deleteMessage(msg) {
    return del(this.apiUrl, {
      chatId: this.chatId,
      messageId: msg,
    }).then((response) => {
      return response;
    });
  }

  #actionEvent(event: Update) {
    log(`${prefix} Received action`);
    this.chatId = event.callback_query.from.id;

    let action = event.callback_query.data;
    log(`${prefix} Current listeners for actions: [${Object.keys(this.listeners.actions).join(",")}]`);

    try {
      log(`${prefix} Find action "${action}" is ${this.listeners.actions.hasOwnProperty(action)}`);

      this.listeners.actions[action](event.callback_query);
    } catch (e) {
      log(`${prefix} Listener for action "${action}" not found`);
    }
  }

  #commandEvent(event: Update) {
    log(`${prefix} Received command`);
    this.chatId = event.message.from.id;

    let command = event.message.text.trim();
    log(`${prefix} Current listeners for commands: [${Object.keys(this.listeners.commands).join(",")}]`);

    try {
      log(`${prefix} Find action "${command}" is ${this.listeners.commands.hasOwnProperty(command)}`);

      this.listeners.commands[command](event.message);
    } catch (e) {
      log(`${prefix} Listener for command "${command}" not found`);
    }
  }

  #messageEvent(event: Update) {
    log(`${prefix} Received simple message`);
    this.chatId = event.message.from.id;

    let message = event.message.text.trim().split(" ")[0];
    log(`${prefix} Current listeners for messages: [${Object.keys(this.listeners.messages).join(",")}]`);

    try {
      log(`${prefix} Find action "${message}" is ${this.listeners.messages.hasOwnProperty(message)}`);

      this.listeners.messages[message](event.message);
    } catch (e) {
      log(`${prefix} Listener for message "${message}" not found`);
    }
  }

  start() {
    getUpdatesLoop(this.delay, this.apiUrl, (data) => {
      try {
        data.forEach((event) => {
          if (event.hasOwnProperty("callback_query")) {
            this.#actionEvent(event)

          } else if (event?.message?.entities && event.message.entities[0]?.type === "bot_command") {
            this.#commandEvent(event)

          } else {
            this.#messageEvent(event)

          }
        })

      } catch (e) {
        log(`${prefix} ${String(e)}`);
      }
    });
  }
}
