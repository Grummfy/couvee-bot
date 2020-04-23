import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { Command } from "../../../contracts/Command"

export class EndGameHandler extends CommandAbstract {
    public name = 'end'

    public help(): string {
        return '**' + this.prefix + this.name + '**: will end the game, wipe the memory and going to sleep!'
    }

    public handle(message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (game) {
            // show stats before closing
            this.commandHandler.getHandlers().forEach((handler: Command) => {
                if (handler.name === 'stats') {
                    handler.handle(message)
                }
            })

            this.gameManager.removeGame(game);
        }

        return message.reply('enjoy!')
    }
}
