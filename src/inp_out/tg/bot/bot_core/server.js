// @ts-nocheck
let updateId = 0

const getUpdates = (url) => {
  let fullUrl = url + '/getUpdates'

  if (updateId !== 0) {
    fullUrl += `?offset=${updateId + 1}`
  }

  return fetch(fullUrl).then((response) => response.json()).then((response) => {

    let status = response.ok
    if (status) {

      let updates = response.result
      if (updates.length) {
        updateId = updates[updates.length - 1].update_id
        return updates
      } else {
        return []
      }

    } else {
      console.log('error: ' + JSON.stringify(response))
      return []
    }
  })
}

const getUpdatesLoop = (delay = 1000, url, callback) => {
  getUpdates(url)
    .then((data) => {
      callback(data)
      setTimeout(() => { getUpdatesLoop(delay, url, callback) }, delay)
    })
    .catch((error) => {
      console.log(error)
    })
}

export {
  getUpdatesLoop
}