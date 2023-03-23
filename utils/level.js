const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { apiHost } = require('../config.json');

const info = require('../info.json');
const emojiData = info['emojis'];
const colorData = info['diffColors'];

module.exports.createLevelEmbed = (levelData, interaction) => {
	let videoId;
	if (levelData.vidLink !== '-5') {
		const parsedUrl = new URL(levelData.vidLink);
		if ([ 'youtube.com', 'www.youtube.com' ].includes(parsedUrl.host)) videoId = parsedUrl.searchParams.get('v');
		if ([ 'youtu.be' ].includes(parsedUrl.hostname)) videoId = parsedUrl.pathname.slice(1);
	}
	else {
		videoId = null;
		levelData.vidLink = null;
	}

	const levelEmbed = new EmbedBuilder()
		.setColor(colorData[levelData.diff])
		.setTitle(`${levelData.artist} - ${levelData.song}`)
		.setDescription(`Level by ${levelData.creator}`)
		.addFields(
			{ name: 'Difficulty', 'value': interaction.client.emojis.cache.get(emojiData['diff'][levelData.diff]).toString(), inline: true },
			{
				name: 'Diff Strength',
				value: (!levelData.diffstrength ? interaction.client.emojis.cache.get(emojiData['misc']['question']).toString() : interaction.client.emojis.cache.get(emojiData['diffStrength'][levelData.diffstrength]).toString()),
				inline: true,
			},
		)
		.setImage((!videoId ? 'https://media.discordapp.net/attachments/1081897177594470471/1087255551211208764/c.png' : `https://i.ytimg.com/vi/${videoId}/original.jpg`))
		.setTimestamp()
		.setFooter({ text: `ID: ${levelData.id}` });

	return levelEmbed;
};

module.exports.createLevelButtons = (levelData) => {
	const levelButtonsRow = new ActionRowBuilder()
		.addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel('YouTube')
				.setEmoji({ id: emojiData['levelData']['youtube'] })
				.setURL(levelData.vidLink || 'https://t21c-adofai.kro.kr')
				.setDisabled(!levelData.vidLink),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel('Download')
				.setEmoji({ id: emojiData['levelData']['download'] })
				.setURL(levelData.dlLink || 'https://t21c-adofai.kro.kr')
				.setDisabled(!levelData.dlLink),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel('Workshop')
				.setEmoji({ id: emojiData['levelData']['workshop'] })
				.setURL(levelData.workshopLink || 'https://t21c-adofai.kro.kr')
				.setDisabled(!levelData.workshopLink),
		]);

	return levelButtonsRow;
};

module.exports.createSearchSelectList = (levelList, page, totalPage, userId, sort) => {
	const selectOptions = [];

	for (const levelData of levelList) {
		const levelName = `${levelData.artist} - ${levelData.song}`;
		let desc;
		if (levelData.creator.length > 90 - levelData.id.toString().length) {
			desc = `by ${levelData.creator.slice(0, 88 - levelData.id.toString().length)} | ID: ${levelData.id}`;
		}
		else {
			desc = `by ${levelData.creator} | ID: ${levelData.id}`;
		}
		selectOptions.push({
			label: levelName.slice(0, 100),
			description: desc,
			value: `showLevel_${userId}_${levelData.id}`,
			emoji: { id: emojiData['diff'][levelData.diff] },
		});
	}

	const levelSelectComponents = [
		new ActionRowBuilder()
			.addComponents([
				new StringSelectMenuBuilder()
					.setCustomId('showLevel')
					.setPlaceholder('Please select a level.')
					.addOptions(selectOptions),
			]),
		new ActionRowBuilder()
			.addComponents([
				new StringSelectMenuBuilder()
					.setCustomId('sort')
					.addOptions([
						{
							label: 'Newer Levels First',
							value: 'RECENT_DESC',
							emoji: { id: emojiData['sort']['RECENT_DESC'] },
							default: (!sort ? true : sort === 'RECENT_DESC'),
						},
						{
							label: 'Older Levels First',
							value: 'RECENT_ASC',
							emoji: { id: emojiData['sort']['RECENT_ASC'] },
							default: sort === 'RECENT_ASC',
						},
						{
							label: 'Harder Levels First',
							value: 'DIFF_DESC',
							emoji: { id: emojiData['sort']['DIFF_DESC'] },
							default: sort === 'DIFF_DESC',
						},
						{
							label: 'Easier Levels First',
							value: 'DIFF_ASC',
							emoji: { id: emojiData['sort']['DIFF_ASC'] },
							default: sort === 'DIFF_ASC',
						},
						{
							label: 'Random',
							value: 'RANDOM',
							emoji: { id: emojiData['sort']['RANDOM'] },
							default: sort === 'RANDOM',
						},
					]),
			]),
		new ActionRowBuilder()
			.addComponents([
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('Previous')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page <= 1),
				new ButtonBuilder()
					.setCustomId('page')
					.setLabel(`${page} / ${totalPage}`)
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page >= totalPage),
			]),
	];

	return {
		content: 'Please select a level.',
		components: levelSelectComponents,
	};
};

module.exports.getLevelApi = async (endpoint, queryOptions) => {
	const api = axios.create({
		baseURL: apiHost,
	});
	return await api.get(endpoint, {
		params: queryOptions,
	});
};