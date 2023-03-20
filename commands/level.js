const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const levelUtils = require('../utils/level');
const { apiHost } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Gets a level by ID')
		.addNumberOption(option =>
			option.setName('id')
				.setDescription('ID of the level')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const id = interaction.options.getNumber('id');

		const api = axios.create({
			baseURL: apiHost,
		});
		const response = await api.get(`levels/${id}`);
		if (response.status === 404) {
			await interaction.editReply('The level could not be found');
			return;
		}
		const levelData = response.data;

		const levelEmbed = levelUtils.createLevelEmbed(levelData, interaction);
		const levelButtonsRow = levelUtils.createLevelButtons(levelData);

		await interaction.editReply({ embeds: [levelEmbed], components: [levelButtonsRow] });
	},
};