// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export function script(wsLink: string, port: number) {
  const fetchUrl = `http://localhost:${port}/api/slack`

  return `let recUrl = "${wsLink}"
let socket = new WebSocket(recUrl)
let count = 10000 + Math.floor(Math.random() * 1000)
const fetchPost = (data) => {
    fetch("${fetchUrl}", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    })
}
const availableTypes = ["desktop_notification", "ping", "pong"]
socket.onmessage = function(event) {
    let response = JSON.parse(event.data)
    if (availableTypes.includes(response.type)) {
        fetchPost(response)
    }
}
socket.onclose = (event) => {
  Promise.resolve().then(() => {
    socket = new WebSocket(recUrl)
  })
}
const keepAlive = () => {
  const body = {"type":"ping","id": count}
  socket.send(JSON.stringify(body))
  fetchPost(body)
  count++
}
setInterval(keepAlive, 1000 * 10)`
}

export function printScript(wsLink: string, port: number) {
  console.log(`-----     BROWSER SCRIPT     -----

${script(wsLink, port)}

-----     BROWSER SCRIPT     -----`)
}