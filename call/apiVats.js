import { logger } from "../be/logger.js"
import dotenv from 'dotenv';
dotenv.config()

function callUsers() {
  let body = {
    "phone": process.env.VATS_FAKE_TELNUM,
    "user": process.env.VATS_USER
  }
  logger.log({ level: 'info', label: 'apiVats', subLable: 'callUsers', message: `Call user. Body: ${JSON.stringify(body)}`, })

  logger.log({ level: 'info', label: 'server', message: `HTTPS => https://${process.env.VATS_DOMAIN}/crmapi/v1/makecall`, })
  fetch(`https://${process.env.VATS_DOMAIN}/crmapi/v1/makecall`, {
    method: 'POST',
    // @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.VATS_KEY
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
      logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status}`, })
      response.json()
    })
    .then((data) => {
      logger.log({ level: 'info', label: 'apiVats', subLable: 'callUsers', message: `Body: ${JSON.stringify(data)}`, })
    });
}

function setupUser() {
  let body = {
    "mobile": process.env.VATS_TELNUM,
    "mobile_redirect": {
      "enabled": true,
      "forward": true
    }
  }
  logger.log({ level: 'info', label: 'apiVats', subLable: 'setupUser', message: `Setup user. Body: ${JSON.stringify(body)}`, })

  logger.log({ level: 'info', label: 'server', message: `HTTPS => https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, })
  fetch(`https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, {
    method: 'PUT',
    // @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.VATS_KEY
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
      logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status}`, })
      response.json()
    })
    .then((data) => {
      console.log(JSON.stringify(data))
      logger.log({ level: 'info', label: 'apiVats', subLable: 'setupUser', message: `Body: ${JSON.stringify(data)}`, })
    });
}

function clearUser() {
  let body = {
    "mobile": "",
    "mobile_redirect": {
      "enabled": false,
      "forward": false
    }
  }
  logger.log({ level: 'info', label: 'apiVats', subLable: 'clearUser', message: `Clear user. Body: ${JSON.stringify(body)}`, })

  logger.log({ level: 'info', label: 'server', message: `HTTPS => https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, })
  fetch(`https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, {
    method: 'PUT',
    // @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.VATS_KEY
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
      logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status}`, })
      response.json()
    })
    .then((data) => {
      console.log(JSON.stringify(data))
      logger.log({ level: 'info', label: 'apiVats', subLable: 'clearUser', message: `Body: ${JSON.stringify(data)}`, })
    });
}

export {
  callUsers,
  setupUser,
  clearUser
}