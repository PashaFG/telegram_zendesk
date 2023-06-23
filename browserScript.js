// @ts-nocheck
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.SERVER_PORT

function writeInstruction() {
  console.log('##### ##### ##### ##### ##### #### ##### #####');
  console.log('##### Place this code in console on slack Web version #####\n\n');
  console.log(`let socket = new WebSocket('${process.env.SLACK_WS}')\nlet count = 10000 + Math.floor(Math.random() * 1000)\nsocket.onmessage = function (event) {\n  let response = JSON.parse(event.data)\n  if (response.type === "desktop_notification") {\n    fetch("http://localhost:${process.env.SERVER_PORT}/api/slack", {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n      },\n      body: JSON.stringify(response),\n    })\n  }\n}\nconst keepAlive = () => {\n  socket.send(\`{"type":"ping","id":\${count}}\`)\n  count++\n}\nsetInterval(keepAlive, 1000 * 10)`);
  console.log('\n\n##### ##### ##### ##### ##### #### ##### #####\n\n');
}

export default {
  writeInstruction
}


// Скрипт для получения уведомлений из слака

/*
let socket = new WebSocket('${process.env.SLACK_WS}')
let count = 10000 + Math.floor(Math.random() * 1000)

socket.onmessage = function(event) {
  let response = JSON.parse(event.data)
  if (response.type === "desktop_notification"){
    fetch("http://localhost:3002/api/slack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    })
  }
}

const keepAlive = () => {
  socket.send(`{"type":"ping","id":${count}}`)
  count++
}

setInterval(keepAlive, 1000 * 10) 
*/
