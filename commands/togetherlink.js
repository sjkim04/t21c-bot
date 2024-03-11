const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('discord.js');
const { togetherApiHost } = require('../config.json');
// const { togetherApiHost, togetherEncKey } = require('../config.json');
// const { encryptText } = require('../utils/general');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('togetherlink')
		.setDescription('Link your Discord account to your Together mod account')
		.addStringOption(option =>
			option.setName('modusername')
				.setDescription('the account name registered in the Together mod')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('linkcode')
				.setDescription('link code sent to your email')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const discordUsername = interaction.user.username;
		const discordUserID = interaction.user.id;
		const togetherUsername = interaction.options.getString('modusername', true);
		// const togetherLinkCode = encryptText(interaction.options.getString('linkcode', true), togetherEncKey);
		const togetherLinkCode = interaction.options.getString('linkcode', true);

		// console.log({
		// 	discordUsername,
		// 	discordUserID,
		// 	togetherUsername,
		// 	togetherLinkCode,
		// });

		let response;

		try {
			console.log(`${discordUsername} registering as ${togetherUsername}...`);
			response = await axios.post(`${togetherApiHost}/linkDiscordAccounts?discordUsername=${discordUsername}&discordUserID=${discordUserID}&togetherUsername=${togetherUsername}&togetherLinkCode=${togetherLinkCode}`);
		}
		catch (error) {
			console.error(error);
			return interaction.editReply('Something went wrong in the Together universe... Please try again later.');
		}

		console.log(response.data);
		return interaction.editReply(response.data);
	},
};