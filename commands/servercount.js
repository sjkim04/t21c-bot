const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('servercount')
		.setDescription('servercount.'),
	async execute(interaction) {
		const serverCount = interaction.client.guilds.cache.size;
		await interaction.reply(`The bot is in ${serverCount} servers.`);
	},
};