import fs from 'fs';
import { AutoQueue } from '@lib/auto-queue';
import { toNormalDate, toNormalDateAndTime, toNormalTime } from '@lib/dates'
import { dictionary, logData } from '@definitions/definitions-logger';

/**  TODO Дописать логику config(), start().
 * Это необходимо, чтобы можно было импортировать не только функции log, debug...., но и весь инстанс логера, без поломки приложения
 * Так же это позволит конфигрурировать логер не из этогофайла, что даст возможноть вносить изменения "На лету"
*/

fs.mkdirSync('logs', { recursive: true });

const aQueue = new AutoQueue()

const LOG_LEVEL_DICTIONARY: dictionary = {
  "debug": 1,
  "info": 2,
  "notice": 3,
  "warning": 4,
  "error": 5,
  "critical": 6,
  "alert": 7,
  "emergency": 8,
}
const LOGGER_CONFIGURATION = {
  logPath: 'logs',
  dailyRotationCombinedLogs: true,
  fileSizeRotation: {
    enabled: true,
    limit: 1 // in Mb
  },
  fileLimitRotation: {
    enabled: false,
    limit: 1000 // count limit rows in file
  },
  dirSizeRotation: {
    enabled: true,
    limit: 100 // in Mb
  },
}
let fileName: string = toNormalDate(new Date())

async function __changeFileName() {
  const date = toNormalDate(new Date())
  const dateAndTime = toNormalDateAndTime(new Date())
  const files = await fs.promises.readdir('logs')
  console.log('change fileName')
  if (files.indexOf(`${date}.log`) >= 0) {
    fileName = dateAndTime
  } else {
    fileName = date
  }
}

function __file_size_rotation(fileHandle: number) {
  if (!LOGGER_CONFIGURATION.dailyRotationCombinedLogs || !LOGGER_CONFIGURATION.fileSizeRotation.enabled) { return }
  fs.fstat(fileHandle, { bigint: false }, (err, stats) => {
    if (!err) {
      if (stats.size > 1024 * 1024 * LOGGER_CONFIGURATION.fileSizeRotation.limit) {
        __changeFileName()
        console.log(`change fileName. new: ${fileName}`)
      }
    }
  })
}

function __file_limit_rotation(fileHandle: number) {
  if (!LOGGER_CONFIGURATION.dailyRotationCombinedLogs || !LOGGER_CONFIGURATION.fileLimitRotation.enabled) { return }
  fs.readFile(`${LOGGER_CONFIGURATION.logPath}/${fileName}.log`, 'utf-8', (err, data) => {
    if (!err) {
      if (data.split('\n').length > LOGGER_CONFIGURATION.fileLimitRotation.limit) {
        __changeFileName()
        console.log(`change fileName. new: ${fileName}`)
      }
    }
  })
}

function __dir_size_rotation() {
  if (!LOGGER_CONFIGURATION.dailyRotationCombinedLogs || !LOGGER_CONFIGURATION.dirSizeRotation.enabled) { return }
}

function __log(data: any) {
  if (data.level === 0 || data.level > 8) {
    console.error(`Undefined log level: ${data.level} `)
    return
  }
  let msg: string
  if (data?.taskId >= 0) {
    msg = `${data.time} ${data.level} TASK-${data.taskId} ${data.message}`;
  } else {
    msg = `${data.time} ${data.level} ${data.message}`;
  }

  msg += "\n"
    
  let fullFileName: string[] = []
  if (data.level >= 5) {
    fullFileName.push(`${LOGGER_CONFIGURATION.logPath}/error.log`, `${LOGGER_CONFIGURATION.logPath}/${fileName}.log`)
  } else {
    fullFileName.push(`${LOGGER_CONFIGURATION.logPath}/${fileName}.log`)
  }

  fullFileName.forEach((file) => {
    fs.open(file, 'a', 0x1a4, function (error, fileHandle) {
      if (!error) {
        __file_size_rotation(fileHandle)
        __file_limit_rotation(fileHandle)
        __dir_size_rotation()
        // console.log(fileHandle)
        fs.write(fileHandle, msg, null, 'utf-8', function (err) {
          if (err) {
            console.log(`${fileName} ${err}`)
          }
          fs.close(fileHandle, function () {
          })
        })
      } else {
        console.log(`${fileName} ${error}`)
      }
    })
  })
}

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

export function log(message: string, logLevel: string | number = 2, taskId?: number) {
  let data: logData = {
    fileName: (LOGGER_CONFIGURATION.dailyRotationCombinedLogs) ? fileName : 'combined',
    time: toNormalTime(new Date()),
    message,
    taskId,
    level: (typeof logLevel == 'string') ? LOG_LEVEL_DICTIONARY[logLevel] || 0 : logLevel
  }
  let _ = ({ ...foo } = {}) => () => new Promise(resolve => setTimeout(resolve, 0, foo));
  aQueue.enqueue(_({ __log, data })).then(({ __log, data }: any | unknown) => __log(data));
}

function debug(message: string, taskId?: number) {
  log(message, 1, taskId)
}
function info(message: string, taskId?: number) {
  log(message, 2, taskId)
}
function notice(message: string, taskId?: number) {
  log(message, 3, taskId)
}
function warning(message: string, taskId?: number) {
  log(message, 4, taskId)
}
function error(message: string, taskId?: number) {
  log(message, 5, taskId)
}
function critical(message: string, taskId?: number) {
  log(message, 6, taskId)
}
function alert(message: string, taskId?: number) {
  log(message, 7, taskId)
}
function emergency(message: string, taskId?: number) {
  log(message, 8, taskId)
}

/** TODO Необходима следующая обработка методов:
 * logger.config() -  конфигурирует сам логер, его поведение, уровни логирование, лимиты директории (по размеру), лимит файла error.log, 
 *                    лимит размера одного файла (по размеру, по занимаемой памяти)
 * logger.log() - записывает логи (конфигурация передаётся внутри метода - т.е. уровень логироавния и т.д.)
 * logger.error(), logger.info() ... - для каждого уровня логирования 
 */
export default {
  log,
  debug,
  info,
  notice,
  warning,
  error,
  critical,
  alert,
  emergency
}