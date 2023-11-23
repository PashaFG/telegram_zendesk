export enum VatsMethod  {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
}

interface VatsMobileRedirect {
    enabled: boolean,
    forward: boolean,
    delay?: number
}

export interface VatsBody {
    phone?: string
    user?: string
    mobile?: string
    mobile_redirect?: VatsMobileRedirect
}

export interface VatsUserResponse {
    message?: string
    login: string,
    name: string,
    position: string,
    email: string,
    ext: string,
    role: string,
    mobile: string,
    mobile_redirect: VatsMobileRedirect
    status: string
}