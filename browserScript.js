import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.SERVER_PORT

function writeInstruction() {
  console.log('##### ##### ##### ##### ##### #### ##### #####');
  console.log('##### Place this code in console on slack Web version #####\n\n');
  console.log(`let socket = new WebSocket('${process.env.SLACK_WS}')\n\nsocket.onmessage = function(event) {\n  let response = JSON.parse(event.data)	\n  if (response.type === "desktop_notification"){\n    fetch("http://localhost:3002/api/slack", {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n      },\n      body: JSON.stringify(response),\n    })\n  }\n}`);
  console.log('\n\n##### ##### ##### ##### ##### #### ##### #####\n\n');
}

export default {
  writeInstruction
}


// Скрипт для получения уведомлений из слака

/*
let socket = new WebSocket('WS_LINK')

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
}; 

*/