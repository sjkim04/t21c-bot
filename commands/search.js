const { SlashCommandBuilder, ComponentType } = require('discord.js');
const axios = require('axios');
const { apiHost } = require('../config.json');
const levelUtils = require('../utils/level');

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
				),
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'level') {
			await interaction.deferReply();

			const query = interaction.options.getString('query');
			const api = axios.create({
				baseURL: apiHost,
			});

			const queryOptions = {
				query: query,
				offset: 0,
				limit: 25,
			};

			const response = await api.get('levels/', {
				params: queryOptions,
			});
			const results = response.data.results;

			if (response.data.count === 0) {
				interaction.editReply('No levels were found.');
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

		}
	},
};