const { ComponentType, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports.disableComponents = (components, excl) => {
	const rows = [];
	if (!Array.isArray(excl)) excl = [excl];

	for (const oldRow of components) {
		const row = new ActionRowBuilder()
			.addComponents(oldRow.components.map(component => {
				if (excl.some(element => component.data.custom_id.startsWith(element))) return component;

				let disabledComp;
				switch (component.data.type) {
				case ComponentType.Button:
					disabledComp = ButtonBuilder.from(component);
					break;
				case ComponentType.StringSelect:
					disabledComp = StringSelectMenuBuilder.from(component);
					break;
				}

				disabledComp.setDisabled(true);
				return disabledComp;

			}));

		rows.push(row);
	}

	return rows;
};

module.exports.permsChecker = async (condition, permsName, interaction) => {
	const results = await condition(interaction);

	if (!results) {
		const embed = this.createNoPermsMessage(interaction, permsName);

		await interaction.reply({ embeds: [embed] });
		return false;
	}

	return true;
};

module.exports.createNoPermsMessage = (interaction, permsName) => {
	const embed = new EmbedBuilder()
		.setColor(0xff0000)
		.setTitle('No Permissions')
		.setDescription(`:x: You do not have permission to run ${interaction.commandName}!\nThis requires the ${permsName} permission.`)
		.setTimestamp();
	return embed;
};