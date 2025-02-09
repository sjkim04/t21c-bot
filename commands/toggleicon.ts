import {
    SlashCommandBuilder,
    InteractionContextType,
    ApplicationIntegrationType,
    ChatInputCommandInteraction
} from 'discord.js'
import * as fs from 'fs'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggleicon')
        .setDescription('Toggle iconsets for bot results')
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
        const userConfigs = JSON.parse(fs.readFileSync('users.json', 'utf8'))
        if (!userConfigs[interaction.user.id]) {
            userConfigs[interaction.user.id] = { iconset: 'default' }
        }

        const userConfig = userConfigs[interaction.user.id]
        if (userConfig.iconset === 'default') {
            userConfig.iconset = 'saph'
            await interaction.reply({
                content:
                    "You have changed your iconset into **Sapphirazurite's Alternative Icons**!\n\nIcons by [Sapphirazurite](<https://youtube.com/@sapphirazurite>)",
                ephemeral: true
            })
        } else if (userConfig.iconset === 'saph') {
            userConfig.iconset = 'default'
            await interaction.reply({
                content:
                    'You have changed your iconset into **TUF Default Icons**!\n\n[Icons by the Universal Forums](<https://github.com/t21c/t21c-assets>), available under [the CC BY 4.0 license](<http://creativecommons.org/licenses/by/4.0/>)',
                ephemeral: true
            })
        }

        userConfigs[interaction.user.id] = userConfig
        fs.writeFileSync('users.json', JSON.stringify(userConfigs, null, 2))
    }
}
