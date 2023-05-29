import { logger } from "./logger.js"
import dotenv from 'dotenv';
dotenv.config()

const emergency = {
  channels: process.env.EMERGENCY_CHANNEL?.split(','),
  people: process.env.EMERGENCY_PEOPLE?.split(','),
  tagSupport: process.env.EMERGENCY_CONTENT
}

let ackSlack = 0

function checkMessage(message) {
  try {
    logger.log({ level: 'info', label: 'slack', subLabel: 'checkMessage', message: `Configuration: ${JSON.stringify(emergency)}`, })
    if (emergency.channels?.includes(message?.channel) || emergency.people?.includes(message?.subtitle) || message.content.match(emergency.tagSupport)) {
      logger.log({ level: 'info', label: 'slack', subLabel: 'checkMessage', message: `Notification has emergency type`, })
      return {
        type: "emergency",
        message: `**ВАЖНО**\nУведомление в слаке:\n${message.content}`
      }
    } else {
      logger.log({ level: 'info', label: 'slack', subLabel: 'checkMessage', message: `Notification has normal type`, })
      return {
        type: "normal",
        message: `Уведомление в слаке:\n${message.content}`
      }
    }
  } catch (e) {
    logger.log({ level: 'info', label: 'slack', subLabel: 'checkMessage', message: `Configuration: ${JSON.stringify(emergency)}`, })
  }
}

function ackSlackNotification() {
  logger.log({ level: 'info', label: 'slack', subLabel: 'ackSlackNotification', message: `Notification has been ack\`d`, })
  ackSlack = 0
}

function getSlackNotification() {
  return ackSlack
}

function setSlackNotification(timestamp) {
  logger.log({ level: 'info', label: 'slack', subLabel: 'setSlackNotification', message: `Set notification time: old - ${ackSlack}, new - ${timestamp}`, })
  ackSlack = timestamp
}


export default {
  checkMessage,
  ackSlackNotification,
  getSlackNotification,
  setSlackNotification
}