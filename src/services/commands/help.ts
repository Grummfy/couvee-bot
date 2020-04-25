import { Message } from 'discord.js'
import { injectable } from 'inversify'
import { CommandAbstract } from '../command-abstract'
import { NiceMessage } from '../../helper/nice-message'

@injectable()
export class HelpHandler extends CommandAbstract {
    public name = 'help'

    public handle(message: Message): Promise<Message | Message[]> {
        let messages: string[] = []
        for (let handler of this.commandHandler.getHandlers()) {
            messages.push(handler.help())
        }

        return message.reply(NiceMessage.wrap(messages.join('\n')))
    }
}
