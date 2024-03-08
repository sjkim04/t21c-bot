const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { apiHost } = require('../config.json');

const info = require('../info.json');
const emojiData = info['emojis'];
const colorData = info['pguDiffColors'];

module.exports.createLevelEmbed = (levelData, interaction) => {
	let videoId;
	if (!!(levelData.vidLink) && levelData.vidLink !== '-5') {
		const parsedUrl = new URL(levelData.vidLink);
		if (['youtube.com', 'www.youtube.com'].includes(parsedUrl.host)) videoId = parsedUrl.searchParams.get('v');
		if (['youtu.be'].includes(parsedUrl.hostname)) videoId = parsedUrl.pathname.slice(1);
		if (parsedUrl.pathname.includes('shorts')) videoId = parsedUrl.pathname.split('/')[2];
	}
	else {
		videoId = null;
		levelData.vidLink = null;
	}

	const color = !colorData[levelData.pgu_diff] ? colorData['0'] : colorData[levelData.pgu_diff];


	let pgu = false;

	if (levelData.pgu_diff === '727') {
		levelData.pgu_diff = 'grande';
	}
	else if (levelData.pgu_diff === '64') {
		levelData.pgu_diff = 'desertbus';
	}
	else if (levelData.pgu_diff === '0.9') {
		levelData.pgu_diff = 'epic';
	}
	else if (levelData.pgu_diff === '-22') {
		levelData.pgu_diff = 'mappack';
	}
	else if (!isNaN(+levelData.pgu_diff)) {
		if (+levelData.pgu_diff >= 21.5) {
			levelData.pgu_diff = 'question';
		}
	}
	else if (emojiData['pguDiff'][levelData.pgu_diff]) {
		pgu = true;
	}

	let diffEmoji;

	if (pgu === false) {
		diffEmoji = !emojiData['pguDiff'][levelData.pgu_diff] ? levelData.pgu_diff.toString() : interaction.client.emojis.cache.get(emojiData['pguDiff'][levelData.pgu_diff]).toString();
	}
	else {
		diffEmoji = `${interaction.client.emojis.cache.get(emojiData['pguDiff'][levelData.pgu_diff]).toString()} | ${interaction.client.emojis.cache.get(emojiData['diff'][levelData.diff]).toString()}`;
	}

	const levelEmbed = new EmbedBuilder()
		.setColor(color)
		.setTitle(`${levelData.artist} - ${levelData.song}`)
		.setDescription(`Level by ${levelData.creator}`)
		.addFields(
			{
				name: 'Difficulty',
				value: diffEmoji,
				inline: true,
			},
		)
		.setImage((!videoId ? 'https://media.discordapp.net/attachments/1142069717612372098/1146082697198960650/dsdadd.png' : `https://i.ytimg.com/vi/${videoId}/original.jpg`))
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
	// const directAdofaiRow = new ActionRowBuilder()
	// 	.addComponents([
	// 		new ButtonBuilder()
	// 			.setStyle(ButtonStyle.Link)
	// 			.setEmoji(':arrow_forward:')
	// 			.setURL(`t21c`)
	// 	])

	return levelButtonsRow;
};

module.exports.createSearchSelectList = (levelList, page, totalPage, userId, sort) => {
	const selectOptions = [];

	for (const levelData of levelList) {
		if (levelData.pgu_diff === '727') {
			levelData.pgu_diff = 'grande';
		}
		else if (levelData.pgu_diff === '64') {
			levelData.pgu_diff = 'desertbus';
		}
		else if (levelData.pgu_diff === '0.9') {
			levelData.pgu_diff = 'epic';
		}
		else if (levelData.pgu_diff === '-22') {
			levelData.pgu_diff = 'mappack';
		}
		else if (!isNaN(+levelData.pgu_diff)) {
			if (+levelData.pgu_diff >= 21.5) {
				levelData.pgu_diff = 'question';
			}
		}

		const emoji = !emojiData['pguDiff'][levelData.pgu_diff] ? '🔢' : { id: emojiData['pguDiff'][levelData.pgu_diff] };

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
			value: `showLevel_${levelData.id}`,
			emoji,
		});
	}

	const levelSelectComponents = [
		new ActionRowBuilder()
			.addComponents([
				new StringSelectMenuBuilder()
					.setCustomId(`showLevel_${userId}`)
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