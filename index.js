// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Team, User, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const { Jejudo } = require('jejudo');

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers ],
	presence: {
		activities: [{ name: 'T21+C', type: ActivityType.Playing }],
	},
});

client.jejudo = new Jejudo(client, {
	isOwner: (user) => owners.includes(user.id),
	prefix: '<@1087228141300371578> ',
	textCommand: 'jejudo',
});

let owners = [];

client.once('ready', async () => {
	const owner = (await client.application?.fetch())?.owner;

	if (owner instanceof Team) {
		owners = owner.members.map((x) => x.id);
	}
	else if (owner instanceof User) {
		owners = [owner.id];
	}
	console.log('ready');
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

loadCommands();
loadEvents();

client.queue = new Map();

// Log in to Discord with your client's token
client.login(token);