const { SlashCommandBuilder, EmbedBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calcacc')
        .setDescription('Calculates the accuracy of a play')
        .addStringOption(option =>
            option
                .setName('judgementlist')
                .setDescription('The list of judgements in T21+C order, split with spaces')
                .setRequired(true),
        )
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        const judgementList = interaction.options.getString('judgementlist');

        let judgements;
        judgements = judgementList.split(' ');
        if (judgements.length !== 7) {
            await interaction.reply({ content: 'Please split judgements with SPACES, and only place 7 numbers.', ephemeral: true });
            return;
        }

        const isNum = judgements.every((num => !isNaN(num)));
        if (!isNum) {
            await interaction.reply({ content: 'Please put judgement numbers here, not rubbish.', ephemeral: true })
            return;
        }
        judgements = judgements.map(num => Number(num));

        const isPositive = judgements.every((num => num >= 0));
        if (!isPositive) {
            await interaction.reply({ content: 'Why would you enter negative values????????', ephemeral: true });
            return;
        }

        const isInt = judgements.every(num => num % 1 === 0);
        if (!isInt) {
            await interaction.reply({ content: 'Why would you enter decimals????', ephemeral: true });
            return;
        }

        const tEarly = judgements[0];
        const early = judgements[1];
        const earlyP = judgements[2];
        const perfect = judgements[3];
        const lateP = judgements[4];
        const late = judgements[5];
        const tLate = judgements[6];

        const judgeCount = tEarly + early + earlyP + perfect + lateP + late + tLate;

        const acc = Math.round(((perfect * 0.01) + (((earlyP + perfect + lateP) / judgeCount) * 100)) * 100000) / 100000;
        const xacc = Math.round(((perfect * 100) + ((earlyP + lateP) * 75) + ((early + late) * 40) + ((tEarly + tLate) * 20)) / judgeCount * 100000) / 100000;

        const embed = new EmbedBuilder()
            .setTitle(`X-Accuracy: ${xacc}% | Legacy Accuracy: ${acc}%`)
            .setDescription(`Judgements:\n\n${tEarly} Early!!s\n${early} Early!s\n${earlyP} EPerfect!s\n${perfect} Perfect!s\n${lateP} LPerfect!s\n${late} Late!s\n${tLate} Late!!s`)
            .setColor('#2f0565')
        interaction.reply({ embeds: [embed] });
    },
};