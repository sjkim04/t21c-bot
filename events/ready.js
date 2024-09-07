const { Events, Team, User, Client, ActivityType } = require('discord.js');
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
		const tufCommands = [];
		const commandsPath = path.join(__dirname, '../commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`../commands/${file}`);
			if (command.tufOnly) tufCommands.push(command.data.toJSON());
			else commands.push(command.data.toJSON());
		}

		commands.push(client.jejudo.commandJSON);

		try {
			console.log(`Started refreshing ${commands.length + tufCommands.length} application (/) commands.`);

			let data, tufData;
			if (debug) {
				data = await client.application.commands.set(commands.concat(tufCommands), guildId);
			}
			else {
				data = await client.application.commands.set(commands);
				tufData = await client.application.commands.set(tufCommands, guildId);
			}

			console.log(`Successfully reloaded ${data.size + tufData.size} application (/) commands.`);
		}
		catch (error) {
			console.error(error);
		}

		const customStatus = [{ name: 'TUF', type: ActivityType.Watching }, { name: 'ADOFAI', type: ActivityType.Competing }, { name: 'ADOfAI', type: ActivityType.Playing }, { state: 'gaming since 2022!', type: ActivityType.Custom }];
		setInterval(() => {
			client.user.setPresence({ activities: customStatus[Math.floor(Math.random() * customStatus.length)] });
		}, 60000);

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};