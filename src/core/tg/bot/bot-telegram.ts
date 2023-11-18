import appConfig from '@config/app-config';
import { getUpdatesLoop } from "./bot-core/server";
import { del, edit, send } from "./bot-core/send-message";
import { log } from "@logger/logger";
import {
  ReplyMarkup,
  TgBotMenu,
  TgConfig,
  TgListeners,
  TgMessageLocalData,
  Update,
} from "@definitions/definitions-tg";
import { UpdateCallbackQuery, UpdateMessage } from "@definitions/childs/telegram";

const prefix = "[telegram][instance]"

export class BotTelegram {
  apiUrl: string;
  delay: number;
  listeners: TgListeners;
  chatId: number;
  botMenu: TgBotMenu
  mainMassageId: number

  constructor(cfg: TgConfig) {
    this.apiUrl = `https://api.telegram.org/bot${cfg.token}`;
    this.delay = cfg.delay;
    this.listeners = {
      commands: {},
      actions: {},
      messages: {},
    }
    this.chatId = 0;
    this.botMenu = {
      keyboard: cfg.menuButtons,
      is_persistent: true,
      resize_keyboard: true,
      input_field_placeholder: "menu",
    }
    this.mainMassageId = 0
  }

  private toSend = async (data: TgMessageLocalData) => {
    return await send(this.apiUrl, data)
  }

  command(msg: string, callback: (event: UpdateMessage) => void) {
    this.listeners.commands[`/${msg}`] = callback;
  }

  action(msg: string, callback: (event: UpdateCallbackQuery) => void) {
    this.listeners.actions[msg] = callback;
  }

  message(msg: string, callback: (event: UpdateMessage) => void) {
    this.listeners.messages[msg] = callback;
  }

  setupMenu(text: string) {
    const body = {
      chatId: this.chatId,
      text,
      reply_markup: this.botMenu,
    }

    return this.toSend(body)
  }

  sendMessage(text: string, reply_markup: ReplyMarkup = {}) {
    return this.toSend({
      chatId: this.chatId,
      text,
      reply_markup,
    });
  }

  editMessage(id: number, text: string, reply_markup: ReplyMarkup = {}) {
    return edit(this.apiUrl, {
      chatId: this.chatId,
      messageId: id,
      text,
      reply_markup,
    }).then((response) => {
      return response;
    });
  }

  editMainMessage(text: string) {
    return edit(this.apiUrl, {
      chatId: this.chatId,
      messageId: this.mainMassageId,
      text,
    })
  }

  async deleteMessage(id: number) {
    return await del(this.apiUrl, {
      chatId: this.chatId,
      messageId: id,
    });
  }

  private setChatId(id = 0) {
    const configId = <number>appConfig.getKey('telegram.chat_id')
    if (id && configId === id) return configId
    this.chatId = id ? id : configId
    appConfig.setKeyWithSave('telegram.chat_id', this.chatId)
  }

  private actionEvent(event: Update) {
    log(`${prefix} Received action`);
    this.setChatId(event.callback_query.from.id)

    const action = event.callback_query.data;
    log(`${prefix} Current listeners for actions: [${Object.keys(this.listeners.actions).join(",")}]`);

    try {
      log(`${prefix} Find action "${action}" is ${Object.prototype.hasOwnProperty.call(this.listeners.actions, action)}`);

      this.listeners.actions[action](event.callback_query);
    } catch (e) {
      log(`${prefix} Listener for action "${action}" not found`);
    }
  }

  private commandEvent(event: Update) {
    log(`${prefix} Received command`);
    this.setChatId(event.message.from.id)

    const command = event.message.text.trim();
    log(`${prefix} Current listeners for commands: [${Object.keys(this.listeners.commands).join(",")}]`);

    try {
      log(`${prefix} Find command "${command}" is ${Object.prototype.hasOwnProperty.call(this.listeners.commands, command)}`);

      this.listeners.commands[command](event.message);
    } catch (e) {
      log(`${prefix} Listener for command "${command}" not found`);
    }
  }

  private messageEvent(event: Update) {
    log(`${prefix} Received simple message`);
    this.setChatId(event.message.from.id)

    const message = event.message.text.trim().split(" ")[0];
    log(`${prefix} Current listeners for messages: [${Object.keys(this.listeners.messages).join(",")}]`);

    try {
      log(`${prefix} Find message "${message}" is ${Object.prototype.hasOwnProperty.call(this.listeners.messages, message)}`);

      this.listeners.messages[message](event.message);
    } catch (e) {
      log(`${prefix} Listener for message "${message}" not found`);
    }
  }

  checkUpdate(event: Update) {
    if (Object.prototype.hasOwnProperty.call(event, "callback_query")) {
      this.actionEvent(event)
      return
    }
    if (event?.message?.entities && event.message.entities[0]?.type === "bot_command") {
      this.commandEvent(event)
      return
    }
    this.messageEvent(event)
  }

  updatesLoopCallback = (data: Update[]) => {
    try {
      data.forEach(data => this.checkUpdate(data))
    } catch (e) {
      log(`${prefix} ${String(e)}`);
    }
  }

  start() {
    this.setChatId()
    getUpdatesLoop(this.delay, this.apiUrl, this.updatesLoopCallback)
  }
}
