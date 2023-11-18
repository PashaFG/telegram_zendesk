export interface dictionary {
    [index: string]: number
}
export interface logData {
    fileName: string
    time: string
    message: string
    level: number
    taskId?: number
}