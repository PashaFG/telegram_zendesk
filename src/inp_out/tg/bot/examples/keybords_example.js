const instructionMessageFailed = {
  "inline_keyboard": [
    [{ "text": "Самостоятельная конфигурация", "callback_data": "errInstructionManual" }, { "text": "Продолжить здесь", "callback_data": "errInstructionTg" }]
  ]
}
const instructionMessageSuccess = {
  "inline_keyboard": [
    [{ "text": "Нет", "callback_data": "okInstructionNo" }, { "text": "Да", "callback_data": "okInstructionYes" }]
  ]
}

const errInstructionManual = {
  "inline_keyboard": [
    [{ "text": "Показать инструкцию", "callback_data": "errInstructionManualInfo" }, { "text": "Готово", "callback_data": "errInstructionDone" }]
  ]
}
const errInstructionManualInfo = {
  "inline_keyboard": [
    [{ "text": "Скрыть инструкцию", "callback_data": "errInstructionManual" }, { "text": "Готово", "callback_data": "errInstructionDone" }]
  ]
}

const errInstructionTg = {
  "inline_keyboard": [
    [{ "text": "Показать инструкцию", "callback_data": "errInstructionTgInfo" }, { "text": "Сохранить", "callback_data": "saveConfig" }]
  ]
}
const errInstructionTgInfo = {
  "inline_keyboard": [
    [{ "text": "Скрыть инструкцию", "callback_data": "errInstructionTg" }, { "text": "Сохранить", "callback_data": "saveConfig" }]
  ]
}

export default {
  instructionMessageFailed,
  instructionMessageSuccess,
  errInstructionManual,
  errInstructionManualInfo,
  errInstructionTg,
  errInstructionTgInfo
}