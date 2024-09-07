const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, OAuth2Scopes, ApplicationIntegrationType, InteractionContextType } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Invite links related to T21+C.')
		.setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
		.setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel),
	execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x42268d)
			.setTitle('Invite links!')
			.setDescription(`Bot invite link:\n${interaction.client.generateInvite({
				permissions: [PermissionFlagsBits.Administrator],
				scopes: [OAuth2Scopes.Bot],
			})}\n\nT21+C Server:\nhttps://discord.gg/8FBDmAPrKe\n\nT21+C Management Sheet:\nhttps://docs.google.com/spreadsheets/d/1eaA1gyZ-6OWFthHFcVTfLV62U_MbpP6PHc8udN24iCg`);
		interaction.reply({ embeds: [embed], ephemeral: true });
	},
};