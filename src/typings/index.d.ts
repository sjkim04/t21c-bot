import { Collection } from 'discord.js'
import { Jejudo } from 'jejudo'

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, any>
        selectHandlers: Collection<string, any>
        buttonHandlers: Collection<string, any>
        debug: boolean
        jejudo: Jejudo
    }
}
