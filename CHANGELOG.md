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