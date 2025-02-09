import {
    Events,
    Team,
    User,
    Client,
    ActivityType,
    ActivityOptions
} from 'discord.js'
import { Jejudo } from 'jejudo'
import { guildId } from '../config.json'
import { createNoPermsMessage } from '../utils/message'
import * as fs from 'node:fs'
import * as path from 'node:path'

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        const debug = client.debug

        let owners: string[] = []
        const owner = (await client.application?.fetch())?.owner

        if (owner instanceof Team) {
            owners = owner.members.map((x) => x.id)
        } else if (owner instanceof User) {
            owners = [owner.id]
        }

        client.jejudo = new Jejudo(client, {
            owners,
            isOwner: (user) => owners.includes(user.id),
            prefix: `<@${client.application?.id}> `,
            textCommand: 'jejudo',
            noPermission: (i) =>
                i.reply({ embeds: [createNoPermsMessage(i, 'Bot Owner')] })
        })

        const commands: any[] = []
        const tufCommands: any[] = []
        const commandsPath = path.join(__dirname, '../commands')
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith('.js'))

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`)
            if (command.tufOnly) tufCommands.push(command.data.toJSON())
            else commands.push(command.data.toJSON())
        }

        commands.push(client.jejudo.commandJSON)

        try {
            console.log(
                `Started refreshing ${commands.length + tufCommands.length} application (/) commands.`
            )

            let data, tufData
            if (debug) {
                data = await client.application?.commands.set(
                    commands.concat(tufCommands),
                    guildId
                )
            } else {
                data = await client.application?.commands.set(commands)
                tufData = await client.application?.commands.set(
                    tufCommands,
                    guildId
                )
            }

            console.log(
                `Successfully reloaded ${data.size + tufData.size} application (/) commands.`
            )
        } catch (error) {
            console.error(error)
        }

        const customStatus: ActivityOptions[] = [
            { name: 'TUF', type: ActivityType.Watching },
            { name: 'ADOFAI', type: ActivityType.Competing },
            { name: 'ADOfAI', type: ActivityType.Playing },
            { name: 'gaming since 2022!', type: ActivityType.Custom }
        ]
        let curStatusIndex = 0
        setInterval(() => {
            curStatusIndex++
            client.user?.setPresence({
                activities: [customStatus[curStatusIndex]]
            })
        }, 60000)

        console.log(`Ready! Logged in as ${client.user?.tag}`)
    }
}
