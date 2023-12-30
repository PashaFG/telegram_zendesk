# v4.2.9
- fix TypeErrors from clear resolvedTickets

# v4.2.8
- add rebuild zendesk url from old .env
- 
# v4.2.7
- edit readme
- fix check ticket on type "zendesk_work_type" === "user"
- minor fix text to telegram messages

# v4.2.6
- minor fix to app-config.json

# v4.2.5
- fix set and check alert time before calling

# v4.2.4
- add slack notification on drop browser script
- add push on tickets events
- add push on slack events
- add call on events
- fix errors to check vats configuration on /status
- change some type in definitions

# v4.2.3
- add slack ping pong session alert
- add /status
- change some type in definitions

# v4.2.2
- Telegram chat id received from getUpdatesLoop
- add telegram chat id to app-config
- add vats-api to setup, get, clear, call user
- add listeners, texts, keyboards to tg
- add setup settings from telegram
- add stop logic
- add setup zendesk user from tg
- add eslint, eslint script and add this script to run dev

# v4.2.1
- fix typescript errors on telegram definitions 
- add @types/cors on dev dependency

# v4.2.0
- edit start script
- remove some unused parts of project
- add clear resolved tickets and off notification from this
- add own logger to project
- refactor 
- slack notification
- refactor project architecture 
- refactor project to ts

# v4.1.3
- add setup menu and hello message
- remove .env.example

# v4.1.2
- add opportunity to import configuration from v3
- add some logs
- add /start to new v4
- add validation configuration
- refactor structure registration tg listeners
- change start bot instance
- change default configuration, if not present
- delete examples to messages
- fix bot instance after start does not start getUpdatesLoop
- other minor fixes

# v4.1.1
- refactor message text to notification
- refactor formatting notification message
- fix non formatted message
- add ack and ack_all to tickets notification

# v4.1.0
- fix "logger is not defined"

# v4.0.5
- ready refactoring ticket, tg, slack, server, utils parts of release

# v4.0.0
- full refactoring release


# v3.1.3
- fix /status for User setting on Vats
- fix doubled message from slack
- fix drop ws on browser
- change browser script
- remove import dotenv for each files. Now dotenv import globally

# v3.1.2
- fix subtitle in log message in apiVats.js
- add write status fetching tickets from zen to console
- add out to console from logger
- add menu to tg bot

# v3.1.1
- fix [Object object] and [Object Response] in logger
- fix error on tg bot command /stop
- fix error PayloadTooLargeError: request entity too large
- add some logs
- add `/status` for telegram bot

# v3.1.0
- add logger

# v3.0.3
- refactor SLA format to message on tg bot

# v3.0.2
- fix non-configurable fetch time

# v3.0.1
- add command /getUnackedTickets

# v3.0.0
- remove the need for the "Tab Reloader" extension and its settings to receive hits from Zendesk
	- refactoring `/start` and `/stop` for telegram bot (New tickets will be requested only after the command is entered (previously this happened after the start of the service))
	- rewrite `envExample`
- add `/help` for telegram bot
- add changelog