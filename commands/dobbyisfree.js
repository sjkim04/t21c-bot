const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dobbyisfree')
		.setDescription('dobby is freeeee'),
	async execute(interaction) {
		await interaction.reply({ content: '/atcisbest', ephemeral: true });
	},
};