const { SlashCommandBuilder } = require('discord.js');
const { t21c_managerrole } = require('../config.json');

module.exports = {
	checkPerms: {
		guildOnly: true,
		condition: interaction => interaction.member.roles.cache.some(role => role.id === t21c_managerrole),
		permsName: 'T21+C Managers',
	},
	data: new SlashCommandBuilder()
		.setName('refreshcheck')
		.setDescription('wow')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether to make the message unvisible to other users'),
		),
	execute(interaction) {
		let ephemeral = interaction.options.getBoolean('ephemeral');
		ephemeral = ephemeral !== null ? ephemeral : true;

		const date = new Date;
		date.setHours(Math.ceil(date.getHours() / 6) * 6);
		date.setMinutes(0, 0, 0);

		const epoch = Math.floor(date.getTime() / 1000);
		interaction.reply({ content: `The next refresh is <t:${epoch}> (<t:${epoch}:R>)`, ephemeral });
	},
};
