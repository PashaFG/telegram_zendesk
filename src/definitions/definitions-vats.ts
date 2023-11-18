export enum VatsMethod  {
    POST = "POST",
    GET = "GET"
}

export interface VatsBody {
    phone?: string
    user?: string
    mobile?: string
    mobile_redirect?: {
        enabled: boolean
        forward: boolean
    }
}