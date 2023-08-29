const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('calcacc')
		.setDescription('Calculates the accuracy of a play')
		.addStringOption(option =>
			option
				.setName('judgementlist')
				.setDescription('The list of judgements in T21+C order, split with spaces')
                .setRequired(true),
		),
	async execute(interaction) {
		const judgementList = interaction.options.getString('judgementlist');

        let judgements;
        judgements = judgementList.split(' ');
        if (judgements.length !== 7) {
            await interaction.reply({ content: 'Please split judgements with SPACES, and only place 7 numbers.', ephemeral: true });
            return;
        }
        for (const judgement in judgements) {
            if (isNaN(judgement)) {
                await interaction.reply('Please put judgement numbers here, not rubbish.')
                return;
            }
        }

        const tEarly = judgements[0];
        const early = judgements[1];
        const earlyP = judgements[2];
        const perfect = judgements[3];
        const lateP = judgements[4];
        const late = judgements[5];
        const tLate = judgements[6];

        const judgeCount = tEarly + early + earlyP + perfect + lateP + late + tLate;

        const acc = (perfect * 0.01) + (((earlyP + perfect + lateP) / judgeCount) * 10000);
        const xacc = Math.round((perfect + (earlyP + lateP) * 75 + (early + late) * 40 + (tEarly + tLate) * 20) / judgeCount * 10000) * 0.01;

        const embed = new EmbedBuilder()
            .setTitle(`X-Accuracy: ${xacc}% | Legacy Accuracy: ${acc}%`)
            .setDescription(`Judgements:\n\n${tEarly} Early!!s\n${early} Early!s\n${earlyP} EPerfect!s\n${perfect} Perfect!s\n${lateP} LPerfect!s\n${late} Late!s\n${tLate} Late!!s`)
            .setColor('#2f0565')
        interaction.reply({ embeds: [embed] });
	},
};