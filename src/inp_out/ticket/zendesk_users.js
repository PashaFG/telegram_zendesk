// @ts-nocheck
import { logger } from "#utils/logger/logger.js"

export class ZendeskUsers {
  constructor(url, session) {
    this.url = url
    this.session = session
    this.users = []
  }

  #saveUsers = (rawUsers) => {
    this.users = rawUsers.users.map(user => { return { id: user.id, name: user.name } })
  }

  fetchUsers = async () => {
    try {
      const url = this.url
      logger.log({ level: 'info', label: 'ZendeskUsers', subLabel: 'fetchUsers', message: `http => ${url}`, })

      let response = await fetch(url, {
        headers: {
          Cookie: `_zendesk_shared_session=${this.session}`
        }
      })

      if (!response.ok) {
        throw new Error(`http <= ${response.status} ${response.body}`)
      } else {
        logger.log({ level: 'info', label: 'ZendeskUsers', subLabel: 'fetchUsers', message: `http <= ${response.status}`, })
        this.#saveUsers(await response.json())
        logger.log({ level: 'info', label: 'ZendeskUsers', subLabel: 'fetchUsers', message: `Fetching users: [${this.users.map(user => user.id).join(';')}]`, })
      }

    } catch (e) {
      logger.log({ level: 'error', label: 'ZendeskUsers ', subLabel: 'fetchUsers', message: `${String(e)}`, })
    }
  }
}