const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { diffColors, emojis } = require('../info.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('calcscore')
		.setDescription('Calculates the score of a play')
		.addStringOption(option =>
			option
				.setName('diff')
				.setDescription('The difficulty of the level (ex: 21+)')
				.setRequired(true),
		)
		.addNumberOption(option =>
			option
				.setName('xacc')
				.setDescription('The X-Accuracy of the pass (ex: 99.99)')
				.setRequired(true),
		)
		.addNumberOption(option =>
			option
				.setName('speed')
				.setDescription('The speed of the pass (ex: 1.1)'),
		)
		.addNumberOption(option =>
			option
				.setName('rankedpos')
				.setDescription('The position from the best score of the player'),
		)
		.addBooleanOption(option =>
			option
				.setName('worldfirst')
				.setDescription('Whether if the pass is world\'s first pass'),
		)
		.addBooleanOption(option =>
			option
				.setName('noearly')
				.setDescription('Whether if the pass doesn\'t have any Early!!s'),
		)
		.addStringOption(option =>
			option
				.setName('version')
				.setDescription('The version of the score formula')
				.setChoices(
					{ name: '2023-08-01 (Accuracy Score Adjustment)', value: 'accNerf1' },
					{ name: '2023-03-31 (Speed Trials Adjustment)', value: 'speedBuff1' },
					{ name: '2023-03-21 (Initial)', value: 'initial' },
				),
		),
	async execute(interaction) {
		await interaction.deferReply();

		let diff = interaction.options.getString('diff');
		const xacc = interaction.options.getNumber('xacc');
		let speed = interaction.options.getNumber('speed');
		let rankedPosition = interaction.options.getNumber('rankedpos');
		const worldFirst = interaction.options.getBoolean('worldfirst');
		let noEarly = interaction.options.getBoolean('noearly');
		const ver = interaction.options.getString('version');

		const displayVer = {
			accNerf1: '2023-08-01 (Accuracy Score Adjustment)',
			speedBuff1: '2023-03-31 (Speed Trials Adjustment)',
			initial: '2023-03-21 (Initial)',
		};

		if (!speed) {
			speed = 1;
		}
		if (!rankedPosition) {
			rankedPosition = 1;
		}
		if (!noEarly && xacc === 100) {
			noEarly = true;
		}

		if (isNaN(+diff)) {
			if (isNaN(+diff.slice(0, 1))) {
				diff = null;
			}
			else if (diff.endsWith('+')) {
				let diffInt = +(diff.split('+')[0]);
				if (diffInt >= 20) {
					diffInt += 0.05;
				}
				else {
					diffInt += 0.5;
				}
				diff = diffInt;
			}
		}
		else {
			diff = +diff;
		}
		diff = Math.round(diff * 100) / 100;

		let scoreBase;
		if (diff < 1) { scoreBase = 0; }
		else {
			switch (diff) {
				case 1:
					scoreBase = 0.05;
					break;
				case 2:
					scoreBase = 0.1;
					break;
				case 3:
					scoreBase = 0.2;
					break;
				case 4:
					scoreBase = 0.3;
					break;
				case 5:
					scoreBase = 0.4;
					break;
				case 6:
					scoreBase = 0.5;
					break;
				case 7:
					scoreBase = 0.6;
					break;
				case 8:
					scoreBase = 0.7;
					break;
				case 9:
					scoreBase = 0.8;
					break;
				case 10:
					scoreBase = 0.9;
					break;
				case 11:
					scoreBase = 1;
					break;
				case 12:
					scoreBase = 2;
					break;
				case 13:
					scoreBase = 3;
					break;
				case 14:
					scoreBase = 5;
					break;
				case 15:
					scoreBase = 10;
					break;
				case 16:
					scoreBase = 15;
					break;
				case 17:
					scoreBase = 20;
					break;
				case 18:
					scoreBase = 30;
					break;
				case 18.5:
					scoreBase = 45;
					break;
				case 19:
					scoreBase = 60;
					break;
				case 19.5:
					scoreBase = 75;
					break;
				case 20:
					scoreBase = 100;
					break;
				case 20.05:
					scoreBase = 110;
					break;
				case 20.1:
					scoreBase = 120;
					break;
				case 20.15:
					scoreBase = 130;
					break;
				case 20.2:
					scoreBase = 140;
					break;
				case 20.25:
					scoreBase = 150;
					break;
				case 20.3:
					scoreBase = 160;
					break;
				case 20.35:
					scoreBase = 170;
					break;
				case 20.4:
					scoreBase = 180;
					break;
				case 20.45:
					scoreBase = 190;
					break;
				case 20.5:
					scoreBase = 200;
					break;
				case 20.55:
					scoreBase = 210;
					break;
				case 20.6:
					scoreBase = 220;
					break;
				case 20.65:
					scoreBase = 230;
					break;
				case 20.7:
					scoreBase = 240;
					break;
				case 20.75:
					scoreBase = 250;
					break;
				case 20.8:
					scoreBase = 275;
					break;
				case 20.85:
					scoreBase = 300;
					break;
				case 20.9:
					scoreBase = 350;
					break;
				case 20.95:
					scoreBase = 400;
					break;
				case 21:
					scoreBase = 500;
					break;
				case 21.05:
					scoreBase = 700;
					break;
				case 21.1:
					scoreBase = 1000;
					break;
				case 21.15:
					scoreBase = 1600;
					break;
				case 21.2:
					scoreBase = 2000;
					break;
				case 21.25:
					scoreBase = 3000;
					break;
				case 21.3:
					scoreBase = 5000;
					break;
				default:
					scoreBase = null;
			}
		}

		if (!scoreBase) {
			await interaction.editReply('Invalid string or number specified for diff.');
			return;
		}

		let xaccMulti = 1;
		if (ver === 'initial' || ver == 'speedBuff1') {
			if (xacc === 100) {
				xaccMulti = 7;
			}
			else if (xacc >= 99.8) {
				xaccMulti = (xacc - 99.73334) * 15 + 3;
			}
			else if (xacc >= 99) {
				xaccMulti = Math.pow(xacc - 97, 1.5484) - 0.9249;
			}
			else if (xacc >= 95) {
				xaccMulti = Math.pow(xacc - 94, 1.6) / 12.1326 + 0.9176;
			}
		}
		else if (ver === 'accNerf1' || !ver) {
			if (xacc === 100) {
				xaccMulti = 6;
			}
			else if (xacc >= 99.8) {
				xaccMulti = (xacc - 99) * 5;
			}
			else if (xacc >= 99) {
				xaccMulti = Math.pow(xacc - 97, 1.5484) - 0.9249;
			}
			else if (xacc >= 95) {
				xaccMulti = Math.pow(xacc - 94, 1.6) / 12.1326 + 0.9176;
			}
		}

		let speedMulti;
		if (ver === 'initial') {
			speedMulti = Math.max(Math.min(1, Math.pow(1 / speed, 2.25) * 1.9775 - 0.5958), 0.5);
		}
		else if (ver === 'speedBuff1') {
			if (speed < 1) speedMulti = 0;
			else if (speed < 1.25) speedMulti = Math.pow(1 / speed, 2.5) + (Math.pow(1 / speed, 2) - Math.pow(1 / speed, 0.5)) * 0.2884;
			else if (speed <= 1.45) speedMulti = 0.5;
			else if (speed <= 1.5) speedMulti = 0.75 + Math.sin(Math.PI * 20 * (speed - 1.375)) * 0.25;
			else speedMulti = Math.pow(speed, 1.3) - Math.pow(speed, 1.1455) + Math.pow(speed - 1, 0.1566);
		}
		else if (ver === 'accNerf1' || !ver) {
			if (speed < 1) speedMulti = 0;
			else if (speed < 1.1) speedMulti = 25 * Math.pow(speed - 1.1, 2) + 0.75;
			else if (speed < 1.2) speedMulti = 0.75;
			else if (speed < 1.25) speedMulti = 50 * Math.pow(speed - 1.2, 2) + 0.75;
			else if (speed < 1.3) speedMulti = -50 * Math.pow(speed - 1.3, 2) + 1;
			else if (speed < 1.5) speedMulti = 1;
			else if (speed < 1.75) speedMulti = 2 * Math.pow(speed - 1.5, 2) + 1;
			else if (speed < 2) speedMulti = -2 * Math.pow(speed - 2, 2) + 1.25;
			else speedMulti = 1.25;
		}

		const noEarlyMulti = noEarly ? 1.1 : 1;

		const baseScore = scoreBase * xaccMulti * speedMulti * noEarlyMulti;

		const generalScore = Math.round(baseScore * (!worldFirst ? 1 : 1.1) * 100) / 100;
		const rankedScore = Math.round(baseScore * (rankedPosition <= 20 ? Math.pow(0.9, rankedPosition - 1) : 0) * 100) / 100;

		const embed = new EmbedBuilder()
			.setColor(diffColors[diff])
			.setTitle(`General Score: ${generalScore} | Ranked Score: ${rankedScore}`)
			.setDescription(`Difficulty: ${interaction.client.emojis.cache.get(emojis['diff'][diff]).toString()}\nX-Accuracy: ${xacc}%\nSpeed Trials: x${speed}\nRanked Position: ${rankedPosition}\nWorld's First: ${worldFirst || false}\nNo Early!!s: ${noEarly || false}${ver ? `\nVersion: ${displayVer[ver]}` : ''}`);

		await interaction.editReply({ embeds: [embed] });
	},
};