import { Message, User, MessageReaction, Collection } from "discord.js";
import { CommandAbstract } from "../../command-abstract";
import { Store } from "../../store";
import { Game } from "../../../game/game";
import { Player } from "../../../game/player";

export class StartGameHandler extends CommandAbstract {
    public name = '#start';

    public isHandled(message: Message): boolean {
        return message.content.startsWith(this.name);
    }

    public handle(message: Message): Promise<Message | Message[]> {
        // get the number of player in the game
        let regex = new RegExp('^' + this.name + ' ((p|player) ?(?<player1>[0-9]*)|(?<player2>[0-9]*) ?(p|player))$')

        let matched = message.content.match(regex)
        let numberOfPlayer = 0;
        if (matched) {
            if (matched.groups.player1) {
                numberOfPlayer = Number.parseInt(matched.groups.player1)
            }
            else if (matched.groups.player2) {
                numberOfPlayer = Number.parseInt(matched.groups.player2)
            }

            if (numberOfPlayer <= 0 || numberOfPlayer > 15) {
                return message.reply('arghh, the number of player is inadequat!');
            }

            let game = new Game();
            
            // define players & player dice
            for (let i = 1; i <= numberOfPlayer; i++) {
                let player = new Player();
                player.label = 'player' + i
                game.players.push(player)
                game.dices.neutral += 4
                game.dices.players[ player.label ] = 0
            }

            // define source
            game.guildId = message.guild.id
            game.channelId = message.channel.id

            // store game
            this.gameManager.setGame(game);
        }

        let msg = message.reply('arghh');
        msg
            .then(message => {

                const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '👌'
                // time is in milliseconds
                const collector = message.createReactionCollector(filter, { time: 60000 });
                collector.on('collect', (reaction: MessageReaction) => console.log(`Collected ${reaction.emoji}`));
            });

            
/*
        let msg = [
            'Players: ',

        ];

        return message.reply(NiceMessage.wrap(msg.join("\n")));
        */

        return msg;
    }
}
