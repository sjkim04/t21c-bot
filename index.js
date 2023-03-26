// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { token, sentryURL } = require('./config.json');

const Sentry = require('@sentry/node');
require('@sentry/tracing');

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages ],
	presence: {
		activities: [{ name: 'T21+C', type: ActivityType.Playing }],
	},
});


function loadCommands() {
	client.commands = new Collection();

	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

function loadEvents() {
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

function loadHandlers() {
	client.selectHandlers = new Collection;
	client.buttonHandlers = new Collection;

	const handlersPath = path.join(__dirname, 'handlers');
	const selectPath = path.join(handlersPath, 'selectMenu');
	const buttonPath = path.join(handlersPath, 'button');

	const selectFiles = fs.readdirSync(selectPath).filter(file => file.endsWith('.js'));
	const buttonFiles = fs.readdirSync(buttonPath).filter(file => file.endsWith('.js'));

	for (const file of selectFiles) {
		const filePath = path.join(selectPath, file);
		const handler = require(filePath);

		client.selectHandlers.set(file.split('.')[0], handler);
	}

	for (const file of buttonFiles) {
		const filePath = path.join(buttonPath, file);
		const handler = require(filePath);

		client.buttonHandlers.set(file.split('.')[0], handler);
	}
}

Sentry.init({
	dsn: sentryURL,
	tracesSampleRate: 0.5,
});

loadCommands();
loadEvents();
loadHandlers();

client.queue = new Map();

// Log in to Discord with your client's token
client.login(token);