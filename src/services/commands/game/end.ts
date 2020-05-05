import { Message } from 'discord.js'
import { CommandAbstract } from '../../command-abstract'
import { Command } from '../../../contracts/Command'

export class EndGameHandler extends CommandAbstract {
    public name = 'end'

    public handle(message: Message): Promise<Message | Message[]> {
        return this.gameManager.getGameFromMessageAsync(message)
            .then((game) => {
                // show stats before closing
                this.commandHandler.getHandlers().forEach((handler: Command) => {
                    if (handler.name === 'stats') {
                        handler.handle(message)
                    }
                })

                this.gameManager.removeGame(game)

                return message.reply('enjoy!')
            })
            .catch(() => {
                return message.reply('enjoy!')
            })
    }
}
