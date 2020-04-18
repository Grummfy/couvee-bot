import { Message, User, MessageReaction } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { Game } from "../../../game/game"
import { Player } from "../../../game/player"
import { NiceMessage } from "../../../helper/nice-message";
import * as _ from "lodash"

export class StartGameHandler extends CommandAbstract {
    public name = 'start'

    public isHandled(message: Message): boolean {
        console.log(this.prefix)
        return message.content.startsWith(this.prefix + this.name)
    }

    public handle(message: Message): Promise<Message | Message[]> {
        // get the number of player in the game
        let regex = new RegExp('^' + this.prefix + this.name + ' ((p|player) ?(?<player1>[0-9]*)|(?<player2>[0-9]*) ?(p|player))$')

        let matched = message.content.match(regex)
        let numberOfPlayer = 0
        let reactions = {}
        let valueStart = "😁".codePointAt(0) - 1
        if (!matched) {
            return message.reply('arghhhhhh')
        }

        if (matched.groups.player1) {
            numberOfPlayer = Number.parseInt(matched.groups.player1)
        }
        else if (matched.groups.player2) {
            numberOfPlayer = Number.parseInt(matched.groups.player2)
        }

        if (numberOfPlayer <= 0 || numberOfPlayer > 15) {
            return message.reply('arghh, the number of player is inadequat!')
        }

        let game = new Game();
        let msg = [
            'Click on the reaction emoji to be associate to a player',
            'Players: ',
        ];
        
        // define players & player dice
        for (let i = 1; i <= numberOfPlayer; i++) {
            let player = new Player();
            player.label = 'player' + i
            game.players.push(player)
            game.dices.neutral += 4
            game.dices.players[ player.label ] = 0

            let emojiValue = Number.parseInt('0x' + (valueStart + i).toString(16))
            let emoji = String.fromCodePoint(emojiValue)
            reactions[ emoji ] = player.label
            msg.push(emoji + ' ' + player.label)
        }

        // define source
        game.guildId = message.guild.id
        game.channelId = message.channel.id

        // store game
        this.gameManager.setGame(game);

        // define the reply
        let reply = message.reply(NiceMessage.wrap(msg.join("\n")));

        // add reaction handling to match each player
        reply
            .then(message => {
                _.forIn(reactions, (playerLabel: string, emoji: string) => {
                    message.react(emoji)
                })

                // keep only reaction that we have defined
                const filter = (reaction: MessageReaction, user: User) => _.has(reactions, reaction.emoji.name) && !user.bot

                // time is in milliseconds
                const collector = message.createReactionCollector(filter, { time: 15000 });
                // TODO prefix of command in variable
                // TODO timing in variable
                // TODO add reaction for each players
                // TODO add reaction for MeuJeu
                // TODO handle remove, dispose and end
                collector.on('collect', (reaction: MessageReaction, user: User) => {
                    let playerLabel = reactions[ reaction.emoji.name ];
                    let player = game.players.find((player: Player) => player.label === playerLabel)
                    player.userId = user.id
                    // TODO if everybody is selected => ask the cci
                    // TODO generate error if reaction.count > 2....

                    console.log(`Collected ${reaction.emoji.name} - ${user.username}`)
                });
                collector.on('end', (collected, reason: string) => {
                    console.debug(message.reactions.removeAll().catch(error => console.error))
                    // TODO if not all player are associate, ask questions
                    // TODO generate error if reaction.count > 2....
                })
            });

            /// TODO mention user thourgh <@ID>
        return reply;
    }
}
