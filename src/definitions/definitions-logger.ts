/** Уровни логирования:
 * [1] debug — Подробная информация для отладки
 * [2] info — Интересные события
 * [3] notice — Существенные события, но не ошибки
 * [4] warning — Исключительные случаи, но не ошибки
 * [5] error — Ошибки исполнения, не требующие сиюминутного вмешательства
 * [6] critical — Критические состояния (компонент системы недоступен, неожиданное исключение)
 * [7] alert — Действие требует безотлагательного вмешательства
 * [8] emergency — Система не работает
 */
export enum logLevel {
    Debug = 1,
    Info = 2,
    Notice = 3,
    Warning = 4,
    Error = 5,
    Critical = 6,
    Alert = 7,
    Emergency = 8
}

export interface logData {
    fileName: string
    time: string
    message: string
    level: number
    taskId?: number
}

export interface loggerConfig {
    logPath: string,
    dailyRotationCombinedLogs: boolean,
    fileSizeRotation: {
        enabled: boolean,
        limit: number,
    },
    fileLimitRotation: {
        enabled: boolean,
        limit: number,
    },
    dirSizeRotation: {
        enabled: boolean,
        limit: number,
    },
}