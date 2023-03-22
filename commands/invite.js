const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Invite links related to T21+C.'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x42268d)
			.setTitle('Invite links!')
			.setDescription('Bot invite link:\nhttps://discord.com/api/oauth2/authorize?client_id=1087228141300371578&permissions=8&scope=bot\n\nT21+C Server:\nhttps://discord.gg/8FBDmAPrKe\n\nT21+C Management Sheet:\nhttps://docs.google.com/spreadsheets/d/1eaA1gyZ-6OWFthHFcVTfLV62U_MbpP6PHc8udN24iCg');
		interaction.reply({ embeds: [embed], ephemeral: true });
	},
};