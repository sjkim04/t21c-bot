const { SlashCommandBuilder, ComponentType } = require('discord.js');
const axios = require('axios');
const { apiHost } = require('../config.json');
const levelUtils = require('../utils/level');
const messageUtils = require('../utils/message');
const { getRandomInt } = require('../utils/general');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('wow search command')
		.addSubcommand(command =>
			command
				.setName('level')
				.setDescription('Search for levels on T21+C')
				.addStringOption(option =>
					option.setName('query')
						.setDescription('General query to search'),
				)
				.addBooleanOption(option =>
					option.setName('random')
						.setDescription('Whether to randomize the results'),
				),
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'level') {
			await interaction.deferReply();

			const query = interaction.options.getString('query');
			const random = interaction.options.getBoolean('random');
			const seed = (random ? getRandomInt(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) : null);

			const api = axios.create({
				baseURL: apiHost,
			});

			const queryOptions = {
				query,
				offset: 0,
				limit: 25,
				random,
				seed,
			};

			const response = await api.get('levels/', {
				params: queryOptions,
			});
			const results = response.data.results;

			if (response.data.count === 0) {
				interaction.editReply('No levels were found.');
				return;
			}

			if (response.data.count === 1) {
				interaction.editReply({ embeds: [levelUtils.createLevelEmbed(results[0])], components: levelUtils.createLevelButtons(results[0]) });
				return;
			}

			let offset = 0;
			const count = response.data.count;

			const msg = await interaction.editReply(levelUtils.createSearchSelectList(results, 1, Math.ceil(count % 25), interaction.user.id));

			const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, filter: i => i.user.id === interaction.user.id, time: 60000 });

			collector.on('collect', async i => {
				if (i.customId === 'prev') {
					offset -= 25;
					if (offset < 0) offset = 0;
				}
				else if (i.customId === 'next') {
					offset += 25;
					if (offset > count) offset = count - 25;
				}

				queryOptions.offset = offset;
				const newResponse = await api.get('levels/', { params: queryOptions });
				const newResults = newResponse.data.results;
				await interaction.editReply(levelUtils.createSearchSelectList(newResults, Math.ceil(offset / 25) + 1, Math.ceil(count % 25), interaction.user.id));

				await i.deferUpdate();
				return collector.resetTimer();
			});

			collector.on('end', async () => {
				const message = await msg.fetch();
				if (message.components.length !== 2) return;
				interaction.editReply({ components: messageUtils.disableComponents(message.components, ['showLevel']) });

			});

		}
	},
};