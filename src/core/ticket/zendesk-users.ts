import logger, { log } from "@logger/logger.js"
import { TicketUsers } from "@definitions/definitions-zendesk"

const prefix = "[zendesk-users]"

export class ZendeskUsers {
    url: string
    session: string
    users: TicketUsers[]
    
    constructor(url: string, session: string) {
        this.url = url
        this.session = session
        this.users = []
    } 

  get listUsersId(): number[] {
    return this.users.map(user => user.id)
  }
  get listUsersName(): string[] {
    return this.users.map(user => user.name)
  }
  get length(): number {
    return this.users.length
  }
  get usersToColumn() {
    const amountUsers = this.length
    const part1 = Math.floor(amountUsers / 3)
    const part2 = Math.floor(amountUsers / 3 * 2)
    const col1 = this.users.slice(0, part1).sort((a, b) => a.name > b.name ? 1 : -1)
    const col2 = this.users.slice(part1, part2).sort((a, b) => a.name > b.name ? 1 : -1)
    const col3 = this.users.slice(part2, amountUsers).sort((a, b) => a.name > b.name ? 1 : -1)
    
    const out = []
    for (let i = 0; i < Math.max(col1.length, col2.length, col3.length); i++){
      out.push(
        [col1[i], col2[i], col3[i]]
          .filter(user => !!user)
          .map(user => {
            return { text: user.name, callback_data: user.id }
          })
      )    
    }

    return out
  } 

  #saveUsers = (rawUsers) => {
    this.users = rawUsers.users.map(user => { return { id: user.id, name: user.name } })
  }

  fetchUsers = async () => {
    try {
      const url = this.url
      log(`${prefix} http => ${url}`)

      let response = await fetch(url, {
        headers: {
          Cookie: `_zendesk_shared_session=${this.session}`
        }
      })

      if (!response.ok) {
        throw new Error(`http <= ${response.status} ${JSON.stringify(response)}`)
      } else {
        log(`${prefix} http <= ${JSON.stringify(response.status)}`)
        this.#saveUsers(await response.json())
        log(`${prefix} Fetching users: [${this.users.map(user => user.id).join(';')}]`)
      }

    } catch (e) {
      logger.log(`${prefix} ${String(e)}`)
    }
  }
}