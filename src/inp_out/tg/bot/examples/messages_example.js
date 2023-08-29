// @ts-nocheck
import appConfig from '#core/config/app_config.js'
const cfg = () => {
  return appConfig.getFullConfig()
}

const formattingRegExp = new RegExp(/(\*|_|~|\||\[|\]|\(|\)|\.|`)/gm)
const numberRegExp = new RegExp(/(\+|7|8| |\()*(\d{3})\D*(\d{3})\D*(\d{2})\D*(\d{2})/gm)

const startMessage = 'Привет\\. Дай мне время\\. Я загружаю и проверяю текущую конфигурацию'
const statusMessage = () => {
  const currentCfg = cfg()
  return [
    '```',
    'CONFIGURATION STATUS:',
    '---------------------------VATS---------------------------',
    `vats_domain - ${currentCfg.vats.domain?.replaceAll(formattingRegExp, '\\$1')}`,
    `vats_key - must be specified in .env (${(currentCfg.vats_key) ? "Exist" : "Missing"})`,
    `vats_user - ${currentCfg.vats.key?.replaceAll(formattingRegExp, '\\$1')}`,
    `vats_telnum - ${currentCfg.vats.telnum.real?.replace(numberRegExp, '7 ($2) $3-$4-$5').replaceAll(formattingRegExp, '\\$1')}`,
    `vats_second_telnum - ${currentCfg.vats.telnum.fake?.replace(numberRegExp, '7 ($2) $3-$4-$5').replaceAll(formattingRegExp, '\\$1')}`,
    '',
    '-------------------------ZENDESK--------------------------',
    `zendesk_view_url - ${currentCfg.zendesk.view_url?.replaceAll(formattingRegExp, '\\$1')}`,
    `zendesk_shared_session - must be specified in .env (${(currentCfg.zendesk.shared_session) ? "Exist" : "Missing"})`,
    `zendesk_organization_id - ${currentCfg.zendesk.organization_id?.replaceAll(formattingRegExp, '\\$1')}`,
    `zendesk_default_group_id - ${currentCfg.zendesk.default_group_id?.replaceAll(formattingRegExp, '\\$1')}`,
    '',
    '--------------------------SLACK---------------------------',
    `slack_ws_link - must be specified in .env (${(currentCfg.slack.ws_link) ? "Exist" : "Missing"})`,
    `emergency_channel - ${currentCfg.slack.emergency.channel.join(',')?.replaceAll(formattingRegExp, '\\$1')}`,
    `emergency_people - ${currentCfg.slack.emergency.people.join(',')?.replaceAll(formattingRegExp, '\\$1')}`,
    `emergency_content - ${currentCfg.slack.emergency.content.join(',')?.replaceAll(formattingRegExp, '\\$1')}`,
    '```'
  ].join('\n')
}

const instructionMessageFailed = 'Настройки выполнены некорректно, измените файл `app_config.json` в корневой директории приложения или измените конфигурацию здесь \\(подробнее в `/help`\\)'
const instructionMessageSuccess = `Все настройки валидны, использовать их?`

const okInstructionNo = 'Измените файл `app_config.json` в корневой директории приложения или измените конфигурацию здесь \\(подробнее в `/help`\\)'

const errInstructionManual = '*Сообщите когда завершите все настройки*'
const errInstructionManualInfo = [
  '*Сообщите когда завершите все настройки*',
  '`app_config.json` находится в корне приложения и представляет собой словарь вида `{"key":"value"}`',
  'Значения, имеющие преписку выше `must be specified in .env` должны быть изначально указаны в файле переменных окружения `.env`, если внести изменения в `app_config.json` в данные поля, то они будут перезаписаны во время следующего рестарта приложения'
].join('\n')

const errInstructionTg = '*По окончанию настройки сохраните конфигурацию*'
const errInstructionTgInfo = [
  '*По окончанию настройки сохраните конфигурацию*',
  'Указание настроек выполняются отправкой сообщения в формате `key value` \\(Например: `vats\\_domain vats.domain.com`\\)',
  'Значения, имеющие преписку выше `must be specified in .env` должны быть изначально указаны в файле переменных окружения `.env`, если внести изменения в `app_config.json` в данные поля, то они будут перезаписаны во время следующего рестарта приложения',
  '',
  '*Расшифровка полей:*',
  '`vats_domain` \\- Домен, через который будут совершаться звонки по оповещениям',
  '`vats_key` \\- Токен для интеграции',
  '`vats_user` \\- Логин сотрудника в домене',
  '`vats_telnum` \\- Номер телефона для оповещений',
  '`zendesk_view_url` \\- Ссылка на вид, за которым будет вестись наблюдение',
  '`zendesk_shared_session` \\- Ссесия для возможности подключения',
  '`zendesk_organization_id` \\- ID компании',
  '`zendesk_default_group_id` \\- ID группы',
  '`slack_ws_link` \\- ссылка WebSocket соединения',
  '`emergency_channel` \\- список важных каналов',
  '`emergency_people` \\- список важных людей',
  '`emergency_content` \\- список важных слов, которые будут отыскиваться в сообщениях',
].join('\n')

const saveConfig = 'Конфигурация заполнена не верно'

export default {
  startMessage,
  statusMessage,
  okInstructionNo,
  instructionMessageSuccess,
  instructionMessageFailed,
  errInstructionManual,
  errInstructionManualInfo,
  errInstructionTg,
  errInstructionTgInfo,
  saveConfig
}