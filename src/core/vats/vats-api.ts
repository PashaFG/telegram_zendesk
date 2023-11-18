import appConfig from "@config/app-config"
import { log } from "@logger/logger.js"
import { VatsMethod, VatsBody } from "@definitions/definitions-vats"

const prefix = "[vats-api]"

async function fetchApi(endpoint: string, method: VatsMethod, body?: VatsBody) {
    const domain = <string>appConfig.getKey("vats.domain")
    const url = `https://${domain}/crmapi/v1/${endpoint}`
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": <string>appConfig.getKey("vats.key"),
        },
    }

    if (body) {
        options["body"] = JSON.stringify(body)
        log(`${prefix} Body: ${JSON.stringify(body)}`)
    }

    log(`${prefix} HTTPS => ${url}`)
    const response = await fetch(url, options);
    log(`${prefix} HTTPS <= ${response.status}`)

    const json = await response.json();
    log(`${prefix} Response body: ${JSON.stringify(json)}`)
    return json
}

export async function callUser() {
    const body = {
        phone: <string>appConfig.getKey("vats.telnum.fake"),
        user: <string>appConfig.getKey("vats.user"),
    }

    await fetchApi("makecall", VatsMethod.POST, body)
}

export async function setupUser() {
    const body = {
        mobile: <string>appConfig.getKey("vats.telnum.real"),
        mobile_redirect: {
            enabled: true,
            forward: true,
        },
    }
    const user = <string>appConfig.getKey("vats.user")

    await fetchApi(`user/${user}`, VatsMethod.POST, body)
}

export async function clearUser() {
    const body = {
        mobile: "",
        mobile_redirect: {
            enabled: false,
            forward: false,
        },
    }
    const user = <string>appConfig.getKey("vats.user")

    await fetchApi(`user/${user}`, VatsMethod.POST, body)
}

export async function getUser() {
    const user = <string>appConfig.getKey("vats.user")

    return await fetchApi(`user/${user}`, VatsMethod.GET)
}