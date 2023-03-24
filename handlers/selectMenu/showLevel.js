const axios = require('axios');
const { apiHost } = require('../../config.json');
const levelUtils = require('../../utils/level');

module.exports = {
	async execute(interaction) {
		if (!interaction.customId.split('_')[1] === interaction.user.id) {
			return;
		}

		await interaction.deferUpdate();

		const levelId = interaction.values[0].split('_')[2];

		const api = axios.create({
			baseURL: apiHost,
		});
		const response = await api.get(`levels/${levelId}`);

		const levelData = response.data;

		const levelEmbed = levelUtils.createLevelEmbed(levelData, interaction);
		const levelButtonsRow = levelUtils.createLevelButtons(levelData);

		await interaction.editReply({ embeds: [levelEmbed], components: [levelButtonsRow] });
	},
};