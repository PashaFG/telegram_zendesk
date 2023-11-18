import { log } from "@logger/logger"
import { TgResponse, TgCallbackFunction } from "@definitions/definitions-tg"

const prefix = "[telegram][server]"
let updateId: number = 0

const getUpdates = (url: string) => {
    let fullUrl = url + "/getUpdates?timeout=1"

    if (updateId !== 0) {
        fullUrl += `&offset=${updateId + 1}`
    }

    return fetch(fullUrl)
        .then((response)=> response.json())
        .then((response: TgResponse) => {
            if (!response.ok) {
                log(`${prefix} Error: ${JSON.stringify(response)}`)
                return []
            }

            const updates = response.result

            if (!updates?.length) {
            return []
            }

            updateId = updates[updates.length - 1].update_id
            return updates
        })
}

function getUpdatesLoop(delay = 1000, url: string, callback: TgCallbackFunction) {
    getUpdates(url)
        .then((data) => {
            callback(data)
            setTimeout(() => {
                getUpdatesLoop(delay, url, callback)
            }, delay)
        })
        .catch((error) => {
            log(`${prefix} ${error}`)
        })
}

export { getUpdatesLoop }
