import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"

export class StatGameHandler extends CommandAbstract {
    public name = 'stats'

    public handle(message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (game) {
            this.gameManager.removeGame(game);
        }
        // TODO ;)

        return message.reply('enjoy!')
    }
}
