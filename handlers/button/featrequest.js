const { quote, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { disableComponents } = require('../../utils/message');

module.exports = {
	checkPerms: {
		condition: interaction => interaction.client.jejudo.isOwner(interaction.user),
		permsName: 'Bot Owner',
	},
	async execute(interaction) {

		await interaction.deferUpdate();
		if (interaction.customId.split('_')[1] === 'accept') {
			const embedMessage = interaction.message;
			const request = embedMessage.embeds[0].data.description;
			const type = interaction.customId.split('_')[3];

			const dmChannel = await interaction.client.users.createDM(interaction.customId.split('_')[2]);
			try {
				await dmChannel.send(`Your feature request for ${type} has been accepted! Your request:\n${quote(request)}\n\nWe'll develop the feature soon, so please hang tight!`);
				await interaction.followUp({ content: 'DM sent :+1:' });

				await embedMessage.edit({ components: disableComponents(embedMessage.components) });
			}
			catch (error) {
				await interaction.followUp({ content: 'Could not send DM :x:' });
			}
		}
		if (interaction.customId.split('_')[1] === 'reject') {
			const embedMessage = interaction.message;
			const request = embedMessage.embeds[0].data.description;
			const type = interaction.customId.split('_')[3];

			const modal = new ModalBuilder()
				.setCustomId('featreject')
				.setTitle('Rejecting Feature Request')
				.addComponents(new ActionRowBuilder()
					.addComponents(new TextInputBuilder()
						.setLabel('Reason for rejecting')
						.setCustomId('reason')
						.setStyle(TextInputStyle.Paragraph),
					),
				);

			await interaction.showModal(modal);

			let modalResp;
			try {
				modalResp = await interaction.awaitModalSubmit({ filter: modalInt => modalInt.user.id === interaction.user.id, time: 30000 });
			}
			catch (e) {
				return;
			}

			const reason = modalResp.fields.getTextInputValue('reason');
			const dmChannel = await interaction.client.users.createDM(interaction.customId.split('_')[2]);

			const reqCommand = interaction.client.application.commands.cache.find(command => command.name = 'featrequest');
			try {
				await dmChannel.send(`Your feature request for ${type} has been rejected.\nYour request:\n${quote(request)}\nReason:\n${quote(reason)}\n\nYou can make another feature request using the </${reqCommand.name}:${reqCommand.id}> command.`);
				await interaction.followUp({ content: 'DM sent :+1:' });

				await embedMessage.edit({ components: disableComponents(embedMessage.components) });
			}
			catch (error) {
				await interaction.followUp({ content: 'Could not send DM :x:' });
			}
		}
	},
};