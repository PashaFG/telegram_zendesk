import dotenv from 'dotenv';
dotenv.config()

const emergency = {
  channels: process.env.EMERGENCY_CHANNEL?.split(','),
  people: process.env.EMERGENCY_PEOPLE?.split(','),
  tagSupport: process.env.EMERGENCY_CONTENT
}

let ackSlack = 0

function checkMessage(message) {
  if (emergency.channels?.includes(message?.channel) || emergency.people?.includes(message?.subtitle) || message.content.match(emergency.tagSupport)) {
    return {
      type: "emergency",
      message: `**ВАЖНО**\nУведомление в слаке:\n${message.content}`
    }
  } else {
    return {
      type: "normal",
      message: `Уведомление в слаке:\n${message.content}`
    }
  }
}

function ackSlackNotification() {
  ackSlack = 0
}

function getSlackNotification() {
  return ackSlack
}

function setSlackNotification(timestamp) {
  ackSlack = timestamp
}


export default {
  checkMessage,
  ackSlackNotification,
  getSlackNotification,
  setSlackNotification
}