import { injectable } from 'inversify'
import { Message } from 'discord.js'
import { CommandAbstract } from '../command-abstract'

@injectable()
export class PingFinder extends CommandAbstract {
    public name = 'ping'

    public handle(message: Message): Promise<Message | Message[]> {
        return message.reply('pong!')
    }
}
