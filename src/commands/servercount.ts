import {
    SlashCommandBuilder,
    InteractionContextType,
    ApplicationIntegrationType,
    ChatInputCommandInteraction
} from 'discord.js'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servercount')
        .setDescription('servercount.')
        .setIntegrationTypes(
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        )
        .setContexts(
            InteractionContextType.BotDM,
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const serverCount = interaction.client.guilds.cache.size
        await interaction.reply(`The bot is in ${serverCount} servers.`)
    }
}
