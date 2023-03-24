const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { channels } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('featrequest')
		.setDescription('Make a feature request for the API or bot.')
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('Which do you want to request a feature to?')
				.addChoices(
					{ name: 'API', value: 'api' },
					{ name: 'Bot', value: 'bot' },
				)
				.setRequired(true),
		),
	async execute(interaction) {
		const type = interaction.options.getString('type');
		let typeDisplay;
		if (type === 'api') {
			typeDisplay = 'API';
		}
		else if (type === 'bot') {
			typeDisplay = 'Bot';
		}

		const modal = new ModalBuilder()
			.setCustomId('feat')
			.setTitle(`Feature Request (${typeDisplay})`)
			.addComponents(new ActionRowBuilder()
				.addComponents(new TextInputBuilder()
					.setLabel(`What feature do you want for the ${typeDisplay}?`)
					.setCustomId('feature')
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

		const feature = modalResp.fields.getTextInputValue('feature');

		const embed = new EmbedBuilder()
			.setColor(0x44258d)
			.setTitle(`New Feature Request by ${interaction.user.tag}`)
			.setDescription(feature)
			.setTimestamp()
			.setFooter({ text: `ID: ${interaction.user.id}・Type: ${type}` });

		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`featrequest_accept_${interaction.user.id}_${type}`)
					.setLabel('Accept')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`featrequest_reject_${interaction.user.id}_${type}`)
					.setLabel('Reject')
					.setStyle(ButtonStyle.Danger),
			);

		const channel = await interaction.client.channels.fetch(channels.featrequest[type]);
		await channel.send({ embeds: [embed], components: [buttons] });

		modalResp.reply({ content: 'Your request has carefully been recoreded.', ephemeral: true });
	},
};