import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"

export class EndGameHandler extends CommandAbstract {
    public name = 'end'

    public handle(message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (game) {
            this.gameManager.removeGame(game);
        }

        return message.reply('enjoy!')
    }
}
