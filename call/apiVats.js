import { logger } from "../be/logger.js"
import dotenv from 'dotenv';
dotenv.config()

function callUsers() {
  let body = {
    "phone": process.env.VATS_FAKE_TELNUM,
    "user": process.env.VATS_USER
  }

  logger.log({ level: 'info', label: 'apiVats', subLabel: 'callUsers', message: `Call user. Body: ${JSON.stringify(body)}`, })
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
      logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status} ${response.statusText}`, })
      return response.json()
    })
    .then((json) => {
      if (json.errors) {
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'callUsers', message: `[ERROR] Body: ${JSON.stringify(json.message)}`, })
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'callUsers', message: `[ERROR] Error: ${JSON.stringify(json.errors)}`, })
      } else {
        logger.log({ level: 'info', label: 'apiVats', subLabel: 'callUsers', message: `Body: ${JSON.stringify(json)}`, })
      }
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
  logger.log({ level: 'info', label: 'apiVats', subLabel: 'setupUser', message: `Setup user. Body: ${JSON.stringify(body)}`, })

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
      logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status} ${response.statusText}`, })
      return response.json()
    })
    .then((json) => {
      if (json.errors) {
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'setupUser', message: `[ERROR] Body: ${JSON.stringify(json.message)}`, })
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'setupUser', message: `[ERROR] Error: ${JSON.stringify(json.errors)}`, })
      } else {
        logger.log({ level: 'info', label: 'apiVats', subLabel: 'setupUser', message: `=Body: ${JSON.stringify(json)}`, })
      }
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
  logger.log({ level: 'info', label: 'apiVats', subLabel: 'clearUser', message: `Clear user. Body: ${JSON.stringify(body)}`, })

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
      logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status} ${response.statusText}`, })
      return response.json()
    })
    .then((json) => {
      if (json.errors) {
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'clearUser', message: `[ERROR] Body: ${JSON.stringify(json.message)}`, })
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'clearUser', message: `[ERROR] Error: ${JSON.stringify(json.errors)}`, })
      } else {
        logger.log({ level: 'info', label: 'apiVats', subLabel: 'clearUser', message: `Body: ${JSON.stringify(json)}`, })
      }
    });
}

function getUser() {
  let out

  logger.log({ level: 'info', label: 'apiVats', subLabel: 'getUser', message: `Get user ${process.env.VATS_USER} configuration`, })
  logger.log({ level: 'info', label: 'server', message: `HTTPS => https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, })

  fetch(`https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, {
    method: 'GET',
    // @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.VATS_KEY
    }
  })
    .then((response) => {
      logger.log({ level: 'info', label: 'server', message: `HTTPS <= ${response.status} ${response.statusText}`, })
      return response.json()
    })
    .then((json) => {
      if (json.errors) {
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'getUser', message: `[ERROR] Body: ${JSON.stringify(json.message)}`, })
        logger.log({ level: 'error', label: 'apiVats', subLabel: 'getUser', message: `[ERROR] Error: ${JSON.stringify(json.errors)}`, })
        out = json
      } else {
        logger.log({ level: 'info', label: 'apiVats', subLabel: 'getUser', message: `Body: ${JSON.stringify(json)}`, })
        out = json
      }
    });
  return out
}

export {
  callUsers,
  setupUser,
  clearUser,
  getUser
}