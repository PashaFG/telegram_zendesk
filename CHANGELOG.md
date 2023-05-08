# v3.0.2
- fix non-configurable fetch time

# v3.0.1
- add command /getUnackedTickets

# v3.0.0
- removed the need for the "Tab Reloader" extension and its settings to receive hits from Zendesk
	- refactoring `/start` and `/stop` for telegram bot (New tickets will be requested only after the command is entered (previously this happened after the start of the service))
	- rewrite `envExample`
- add `/help` for telegram bot
- add changelog