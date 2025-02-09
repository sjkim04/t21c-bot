import {
    ComponentType,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ActionRow,
    MessageActionRowComponent,
    MessageActionRowComponentBuilder
} from 'discord.js'

export const disableComponents = (
    components: ActionRow<MessageActionRowComponent>[],
    excl: string | string[]
) => {
    const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = []
    if (!Array.isArray(excl)) excl = [excl]

    for (const oldRow of components) {
        const row =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                oldRow.components.map((component) => {
                    if (
                        excl.some((element) => {
                            component.customId.startsWith(element)
                        })
                    )
                        return component

                    let disabledComp
                    switch (component.type) {
                        case ComponentType.Button:
                            disabledComp = ButtonBuilder.from(component)
                            break
                        case ComponentType.StringSelect:
                            disabledComp =
                                StringSelectMenuBuilder.from(component)
                            break
                    }

                    disabledComp.setDisabled(true)
                    return disabledComp
                })
            )

        rows.push(row)
    }

    return rows
}

export const permsChecker = async (
    condition,
    permsName,
    guildOnly,
    interaction
) => {
    if (guildOnly && !interaction.inGuild()) {
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('Server Only')
            .setDescription(
                `:x: The ${interaction.commandName} command cannot be run in DMs!\nPlease run this in a server.`
            )
            .setTimestamp()
        await interaction.reply({ embeds: [embed] })
        return false
    }
    const results = await condition(interaction)

    if (!results) {
        const embed = createNoPermsMessage(interaction, permsName)

        await interaction.reply({ embeds: [embed] })
        return false
    }

    return true
}

export const createNoPermsMessage = (interaction, permsName): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('No Permissions')
        .setDescription(
            `:x: You do not have permission to run ${interaction.commandName}!\nThis requires the ${permsName} permission.`
        )
        .setTimestamp()
    return embed
}
