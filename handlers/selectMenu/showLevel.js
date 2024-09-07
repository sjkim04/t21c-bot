const levelUtils = require('../../utils/level');

module.exports = {
	async execute(interaction) {
		if (!interaction.customId.split('_')[1] === interaction.user.id) {
			return;
		}

		await interaction.deferUpdate();

		const levelId = interaction.values[0].split('_')[1];

		const levelResponse = await levelUtils.getTUFApi(`levels/${levelId}`);
		const levelData = levelResponse.data;

		const passesResponse = await levelUtils.getTUFApi('passes/', { levelId, sort: 'SCORE_DESC' });
		const passesData = passesResponse.data;

		const levelEmbed = levelUtils.createLevelEmbed(levelData, passesData, interaction);
		const levelButtonsRow = levelUtils.createLevelButtons(levelData);

		await interaction.editReply({ content: '', embeds: [levelEmbed], components: levelButtonsRow });
	},
};