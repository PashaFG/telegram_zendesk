export interface SlackEventConfig {
    event_ts: number | string,
    content: string,
    channel: string,
    subtitle: string
}