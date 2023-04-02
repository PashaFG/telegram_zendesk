import dotenv from 'dotenv';
dotenv.config()

function callUsers() {
  let body = {
    "phone": process.env.VATS_FAKE_TELNUM,
    "user": process.env.VATS_USER
  }
  console.log('call user');

  fetch(`https://${process.env.VATS_DOMAIN}/crmapi/v1/makecall`, {
    method: 'POST',
    // @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.VATS_KEY
    },
    body: JSON.stringify(body)
  })
    .then((response) => response.json())
  // .then((data) => console.log(JSON.stringify(data)));
}

function setupUser() {
  let body = {
    "mobile": process.env.VATS_TELNUM,
    "mobile_redirect": {
      "enabled": true,
      "forward": true
    }
  }

  fetch(`https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, {
    method: 'PUT',
    // @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.VATS_KEY
    },
    body: JSON.stringify(body)
  })
    .then((response) => response.json())
  // .then((data) => console.log(JSON.stringify(data)));
}

function clearUser() {
  let body = {
    "mobile": "",
    "mobile_redirect": {
      "enabled": false,
      "forward": false
    }
  }

  fetch(`https://${process.env.VATS_DOMAIN}/crmapi/v1/users/${process.env.VATS_USER}`, {
    method: 'PUT',
    // @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.VATS_KEY
    },
    body: JSON.stringify(body)
  })
    .then((response) => response.json())

}

export {
  callUsers,
  setupUser,
  clearUser
}