import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import * as _ from "lodash"
import { Game } from "../../../game/game";
import { Player } from "../../../game/player";

export class DevHandler extends CommandAbstract {
    public name = 'dev'

    public handle(message: Message): Promise<Message | Message[]> {
        let game = new Game()
        game.dices.players['player1'] = 5
        game.dices.neutral = 3
        game.guildId = message.guild.id
        game.channelId = message.channel.id
        game.players['272393424819191808'] = new Player()
        game.players['272393424819191808'].mind = 6
        game.players['272393424819191808'].label = 'player1'
        game.players['272393424819191808'].userId = '272393424819191808'
        this.gameManager.setGame(game)

        return message.reply('enjoy!')
    }
}
