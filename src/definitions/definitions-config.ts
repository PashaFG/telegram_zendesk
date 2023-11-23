export enum PushType {
    Push = "push",
    Call = "call"
}

export enum ZendeskAlertingType {
    Default = "default",
    User = "user",
    Group = "group"
}

export interface AlertConfigTimeType {
      normal: number,
      emergency: number
}
export interface AlertConfigType {
    type: PushType,
    zendesk_alerting: boolean,
    zendesk_alerting_type: ZendeskAlertingType,
    slack_alerting: boolean,
    time: AlertConfigTimeType,
}
export interface LoggerConfigType {
    path: string,
    fileSize: number,
    dirSize: number,
}
export interface VatsConfigTelnumType {
    real: string,
    fake: string,
}
export interface VatsConfigType {
    key: string,
    domain: string,
    user: string,
    telnum: VatsConfigTelnumType,
}
export interface ZendeskUserConfigType {
    id: number,
    name: string
}
export interface ZendeskConfigType {
    domain: string,
    view_url: string,
    users_url: string,
    default_group_id: string,
    user: ZendeskUserConfigType,
    shared_session: string,
}
export interface SlackConfigEmergencyType {
    channel: string[],
    people: string[],
    content: string[],
}
export interface SlackConfigType {
    ws_link: string,
    emergency: SlackConfigEmergencyType,
}

export interface ConfigTelegram {
    bot_token: string,
    chat_id: number,
}

export interface Config {
    telegram: ConfigTelegram
    server_port: number,
    alert: AlertConfigType,
    logger: LoggerConfigType,
    vats: VatsConfigType,
    zendesk: ZendeskConfigType,
    slack: SlackConfigType,
}

export type ValueConfigType = boolean | string | number | string[] | AlertConfigTimeType | AlertConfigType | LoggerConfigType | VatsConfigTelnumType | VatsConfigType | ZendeskUserConfigType | ZendeskConfigType | SlackConfigEmergencyType | SlackConfigType | Config