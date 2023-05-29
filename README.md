# Инструкция по настройке и работе

## Настройка оповещений из Zendesk

В случае отсутствия возможности авторизация в API Zendesk по средствам Логин/Пароля или Zendesk token возможно использовать  \_zendesk_shared_session, для  его получения, необходимо в полезной нагрузке найти получить запрос execute, из которого в куки запроса вытащить \_zendesk_shared_session и указать в .env файле - в параметре ZENDESK_SHARED_SESSION

Управление частотой запросов задаётся параметром FETCH_TIME

```
значение в < 15 (15*1000) секунд вызывает 429 ошибку (rate-limiter)

комфортным значением для работы будет не менее 1 минуты
```

## Настройка оповещений из Slack:

Открыть Slack в веб версии, далее зайти в консоль разработчика (F12 > console), вставить необходимый скрипт

## Основные настройки

Выполнить настройку файла .env (инструкция в файле envExample)
Запустить сервер с ботом командой `npm run serve` (Если необходимо установить или обновить зависимости - `npm i`)

Команды для бота:

```
/start - Настраивает сотрудника в ВАТС, включает сервис получения обращений, включает оповещения о событиях и последующие звонки
/stop - Удаляет настройку сотрудника в ВАТС, отключает получение обращений и оповещения о событиях
/ack 000000 - Подтверждает обращение номер 000000 и отменяет последующий звонок по нему
/slack - Подтверждает ВСЕ полученные сообщения от SLACK и отключает оповещения по ним
/ack 123456 - "Подтверждает" тикет и отменяет звонки по нему
/getUnackedTickets - возвращает список тикетов, находящихся без подтверждения
```

## Logger

В переменных окружения .env можно указать 3 параметра для логирования:

```
LOGGER_SIZE_LIMIT_FILE - лимит одного файла для combined логов, по достижению данного лимита, будет создан новый лог файл, куда продолжиться запись
LOGGER_SIZE_LIMIT_DIRECTORY - лимит размера для всей директории с логами. По достижению лимита будет удалён самый старый лог файл (кроме error.log)
LOGGER_PATH_TO_DIRECTORY - путь до директории логов, куда будут писаться логи
```

error.log - файл, который учитывается при размере всей директории, но будет удалён, его отчистка происходит вручную (при необходимости), все ошибки, попавшие в данный файл, так же пишутся и в combined.log