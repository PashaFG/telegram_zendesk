import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config()

const { combine, timestamp, label, printf } = format;
const PATH_TO_DIR = String(process.env.LOGGER_PATH_TO_DIRECTORY)
const FILE_MAX_SIZE = Number(process.env.LOGGER_SIZE_LIMIT_FILE) // in MB
const DIRECTORY_MAX_SIZE = Number(process.env.LOGGER_SIZE_LIMIT_DIRECTORY) // in MB

let currentDate = new Date()
let current_file = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}.log`

const myFormat = printf(({ level, message, label, subLabel, timestamp }) => {
  if (label && subLabel) return `${timestamp} [${label}][${subLabel}] ${level}: ${message}`;
  if (label || subLabel) return `${timestamp} [${(label) ? label : subLabel}] ${level}: ${message}`;
  return `${timestamp} ${level}: ${message}`
});

const logConfiguration = {
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.File({ filename: `${PATH_TO_DIR}error.log`, level: 'error' }),
    new transports.File({ filename: `${PATH_TO_DIR}${current_file}` }),
    new transports.Console({ level: 'warn' })
  ]
}
const logger = createLogger(logConfiguration);

function logTransfer() {
  fs.stat(`${PATH_TO_DIR}${current_file}`, (error, stats) => {
    if (error) { logger.log({ level: 'error', label: 'logCleaner', subLable: 'logTransfer', message: String(error), }) }
    else if (stats.size / (1024 * 1024) >= Number(FILE_MAX_SIZE)) {
      currentDate = new Date()
      current_file = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}_${String(currentDate.getHours()).padStart(2, "0")}-${String(currentDate.getMinutes()).padStart(2, "0")}.log`
      logger.configure({
        transports: [
          new transports.File({ filename: `${PATH_TO_DIR}error.log`, level: 'error' }),
          new transports.File({ filename: `${PATH_TO_DIR}${current_file}` }),
        ]
      })
    }
  });
}

async function dirSize(path) {
  const files = await fs.promises.readdir(path);
  files.splice(files.indexOf('error.log'), 1)
  const stats = files.map(file => fs.promises.stat(`${path}${file}`));
  return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
}

function deleteLastFile(path) {
  try {
    const files = fs.readdirSync(path);
    files.splice(files.indexOf('error.log'), 1)
    let fileToDelete = {}
    files.forEach((file) => {
      const stat = fs.statSync(`${path}${file}`)
      // @ts-ignore
      if (!fileToDelete.ctime || fileToDelete.ctime < stat.ctime) {
        fileToDelete.name = file
        fileToDelete.ctime = file
      }
    })
    if (fileToDelete.name) {
      fs.unlinkSync(`${PATH_TO_DIR}${fileToDelete.name}`)
    }
  } catch (e) {
    logger.log({ level: 'error', label: 'logCleaner', subLable: 'dirSize', message: String(e), })
  }
}

async function logCleaner() {
  const stats = await dirSize(PATH_TO_DIR)
  if (stats / (1024 * 1024) >= Number(DIRECTORY_MAX_SIZE)) {
    deleteLastFile(PATH_TO_DIR)
  } else {
    logTransfer()
  }
}


export {
  logger,
  logCleaner
}