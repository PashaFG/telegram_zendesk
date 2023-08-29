const send = (url = "", data = {}) => {
  const fullUrl = url + '/sendMessage'
  const bodyData = {
    chat_id: data.chatId,
    text: data.text,
    parse_mode: "MarkdownV2",
  }

  if (data.reply_markup) {
    bodyData.reply_markup = data.reply_markup
  }

  return fetch(fullUrl, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData)
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.ok) {
        return response
      } else {
        console.log(response)
        return false
      }
    })
}

const edit = (url = "", data = {}) => {
  const fullUrl = url + '/editMessageText'

  const bodyData = {
    chat_id: data.chatId,
    message_id: data.messageId,
    text: data.text,
    parse_mode: 'MarkdownV2',
  }

  if (data.reply_markup) {
    bodyData.reply_markup = data.reply_markup
  }

  return fetch(fullUrl, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData)
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.ok) {
        return response
      } else {
        console.log(response)
        return false
      }
    })
}

const del = (url = "", data = {}) => {
  const fullUrl = url + '/deleteMessage'

  const bodyData = {
    chat_id: data.chatId,
    message_id: data.messageId,
  }

  return fetch(fullUrl, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData)
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.ok) {
        return response
      } else {
        console.log(response)
        return false
      }
    })
}

export {
  send,
  edit,
  del
}