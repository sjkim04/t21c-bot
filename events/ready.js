const { Events, Team, User } = require('discord.js');
const { Jejudo } = require('jejudo');
const { guildId } = require('../config.json');
const { createNoPermsMessage } = require('../utils/message');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const debug = client.debug;
		const atc = client.atc;

		let owners = [];
		const owner = (await client.application?.fetch())?.owner;

		if (owner instanceof Team) {
			owners = owner.members.map((x) => x.id);
		}
		else if (owner instanceof User) {
			owners = [owner.id];
		}


		client.jejudo = new Jejudo(client, {
			owners,
			isOwner: (user) => owners.includes(user.id),
			prefix: `<@${client.application.id}> `,
			textCommand: 'jejudo',
			noPermission: i => i.reply({ embed: createNoPermsMessage(i, 'Bot Owner') }),
		});


		const commands = [];
		const commandsPath = path.join(__dirname, '../commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`../commands/${file}`);
			if (atc) {
				if (command.data.name === 'dobbyisfree') commands.push(command.data.toJSON());
			}
			else if (!atc) {
				if (command.data.name !== 'dobbyisfree') commands.push(command.data.toJSON());
			}
		}

		if (!atc) commands.push(client.jejudo.commandJSON);

		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);

			let data;
			if (atc) {
				data = await client.application.commands.set(commands, '1073949499480875078');
			}
			else if (debug) {
				data = await client.application.commands.set(commands, guildId);
			}
			else {
				data = await client.application.commands.set(commands);
			}

			console.log(`Successfully reloaded ${data.size} application (/) commands.`);
		}
		catch (error) {
			console.error(error);
		}

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};