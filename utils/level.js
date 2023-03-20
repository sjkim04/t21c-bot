const fs = require('node:fs');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const emoji = fs.readFileSync('emoji.json');
const emojiData = JSON.parse(emoji);

function createLevelEmbed(levelData, interaction) {
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

	const levelEmbed = {
		color: 0x0099ff,
		title: `${levelData.artist} - ${levelData.song}`,
		description: `Level by ${levelData.creator}`,
		fields: [
			{
				name: 'Difficulty',
				value: interaction.client.emojis.cache.get(emojiData['diff'][levelData.diff]).toString(),
				inline: true,
			},
			{
				name: 'Diff Strength',
				value: (!levelData.diffstrength ? interaction.client.emojis.cache.get(emojiData['misc']['question']).toString() : interaction.client.emojis.cache.get(emojiData['diffStrength'][levelData.diffstrength]).toString()),
				inline: true,
			},
		],
		image: {
			url: (!videoId ? 'https://media.discordapp.net/attachments/1081897177594470471/1087255551211208764/c.png' : `https://i.ytimg.com/vi/${videoId}/original.jpg`),
		},
		timestamp: new Date().toISOString(),
		footer: {
			text: `ID: ${levelData.id}`,
		},
	};

	return levelEmbed;
}

function createLevelButtons(levelData) {
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
}

function createSearchSelectList(levelList, page, totalPage, userId) {
	const selectOptions = [];

	for (const levelData of levelList) {
		const levelName = `${levelData.artist} - ${levelData.song}`;
		selectOptions.push({
			label: levelName.slice(0, 100),
			description: `by ${levelData.creator} | ID: ${levelData.id}`,
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
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('Previous')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page <= 1),
				new ButtonBuilder()
					.setCustomId('page')
					.setLabel(`${page} / ${totalPage}`)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true),
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
}

module.exports = { createLevelEmbed, createLevelButtons, createSearchSelectList };