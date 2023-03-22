const { ComponentType, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

function disableComponents(components, excl) {
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
}

module.exports = { disableComponents };