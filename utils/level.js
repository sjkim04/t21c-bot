const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, RichPresenceAssets } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const { apiHost } = require('../config.json');

const info = require('../info.json');
const emojiData = info['emojis'];
const colorData = info['pguDiffColors'];

module.exports.createLevelEmbed = (levelData, passesData, interaction) => {
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

	const color = !colorData[levelData.pguDiff] ? colorData['0'] : colorData[levelData.pguDiff];

	const diffSet = this.getDiffSet(interaction.user.id);

	let pgu = false;

	if (levelData.pguDiff === '727') {
		levelData.pguDiff = 'grande';
	}
	else if (levelData.pguDiff === '64') {
		levelData.pguDiff = 'desertbus';
	}
	else if (levelData.pguDiff === '0.9') {
		levelData.pguDiff = 'epic';
	}
	else if (levelData.pguDiff === '-22') {
		levelData.pguDiff = 'mappack';
	}
	else if (!isNaN(+levelData.pguDiff)) {
		if (+levelData.pguDiff >= 21.5) {
			pgu = false;
		}
	}
	else if (diffSet[levelData.pguDiff]) {
		pgu = true;
	}

	let diffEmoji;

	if (pgu === false) {
		diffEmoji = !diffSet[levelData.pguDiff] ? levelData.pguDiff.toString() : interaction.client.emojis.cache.get(diffSet[levelData.pguDiff]).toString();
	}
	else {
		diffEmoji = `${interaction.client.emojis.cache.get(diffSet[levelData.pguDiff]).toString()} | ${interaction.client.emojis.cache.get(emojiData['diff'][levelData.diff]).toString()}`;
	}

	const bestPassData = passesData.results[0];

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
			{
				name: 'Clears',
				value: `${passesData.count}`,
				inline: true,
			},
		)
		.setImage((!videoId ? 'https://media.discordapp.net/attachments/1142069717612372098/1146082697198960650/dsdadd.png' : `https://i.ytimg.com/vi/${videoId}/original.jpg`))
		.setTimestamp()
		.setFooter({ text: `ID: ${levelData.id}` });

	if (passesData.count > 0) {
		levelEmbed.addFields({
			name: 'Best Clear',
			value: `${bestPassData.player} (${Math.round(bestPassData.scoreV2 * 100) / 100})`,
			inline: true,
		});
	}

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
	const directAdofaiRow = new ActionRowBuilder()
		.addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel('TUF')
				.setEmoji({ id: '1168507226521079889' })
				.setURL(`https://tuforums.com/leveldetail?id=${levelData.id}`),
			// new ButtonBuilder()
			// 	.setStyle(ButtonStyle.Link)
			// 	.setEmoji(':arrow_forward:')
			// 	.setURL(`t21c`)
		]);

	return [levelButtonsRow, directAdofaiRow];
};

module.exports.createSearchSelectList = (levelList, page, totalPage, userId, sort) => {
	const selectOptions = [];

	for (const levelData of levelList) {
		if (levelData.pguDiff === '727') {
			levelData.pguDiff = 'grande';
		}
		else if (levelData.pguDiff === '64') {
			levelData.pguDiff = 'desertbus';
		}
		else if (levelData.pguDiff === '0.9') {
			levelData.pguDiff = 'epic';
		}
		else if (levelData.pguDiff === '-22') {
			levelData.pguDiff = 'mappack';
		}

		const diffSet = this.getDiffSet(userId);

		const emoji = !diffSet[levelData.pguDiff] ? '🔢' : { id: diffSet[levelData.pguDiff] };

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

module.exports.getTUFApi = async (endpoint, queryOptions) => {
	const api = axios.create({
		baseURL: apiHost,
	});
	return await api.get(endpoint, {
		params: queryOptions,
	});
};

module.exports.getDiffSet = (userId) => {
	const userPrefs = JSON.parse(fs.readFileSync('users.json', 'utf8'));
	if (!userPrefs[userId]) {
		userPrefs[userId] = { iconset: 'default' };
		fs.writeFileSync('users.json', JSON.stringify(userPrefs, null, 2));
	}

	const iconPref = userPrefs[userId]['iconset'];
	let diffSetName;
	switch (iconPref) {
		case 'saph':
			diffSetName = 'pguDiffSaph';
			break;
		case 'default':
		default:
			diffSetName = 'pguDiff';
	}
	return emojiData[diffSetName];
}