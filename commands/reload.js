const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');


module.exports = {
	checkPerms: {
		condition: interaction => interaction.client.jejudo.isOwner(interaction.user),
		permsName: 'Bot Owner',
	},
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads commands'),
	async execute(interaction) {

		function loadCommands() {
			const commandsPath = path.join(__dirname, '/../commands');
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				delete require.cache[require.resolve(filePath)];
				const command = require(filePath);
				// Set a new item in the Collection with the key as the command name and the value as the exported module
				if ('data' in command && 'execute' in command) {
					client.commands.delete(command.data.name);
					client.commands.set(command.data.name, command);
				}
				else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}

		const client = interaction.client;
		if (interaction.client.jejudo.isOwner(interaction.user)) {
			await interaction.reply({ content: 'Reloading commands...', ephemeral: true });
			await loadCommands();
			await interaction.editReply('Reloaded all commands.');
		}
		else {
			interaction.reply({ content: 'You do not have permission to reload!', ephemeral: true });
		}
	},
};
