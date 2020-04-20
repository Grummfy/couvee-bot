import { Message, User, MessageReaction, Collection } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { Game } from "../../../game/game"
import { Player } from "../../../game/player"
import { NiceMessage } from "../../../helper/nice-message"
import * as _ from "lodash"
import { isNullOrUndefined } from "util"
import { Result } from "@badrap/result"

/**
 * Command to start a game:
 * * ask the number of players
 * * define the global CC available
 * * associate user and player
 * * start the game
 */
export class StartGameHandler extends CommandAbstract {
    public name = 'start'

    public handle(message: Message): Promise<Message | Message[]> {
        // get the number of player in the game
        let regex = new RegExp('^' + this.prefix + this.name + ' ((p|player) ?(?<player1>[0-9]*)|(?<player2>[0-9]*) ?(p|player))$')

        let matched = message.content.match(regex)
        let numberOfPlayer = 0
        let reactions = {}
        let valueStart = "😁".codePointAt(0)
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

            // we init with label ;)
            game.players[player.label] = player

            game.dices.neutral += 4
            game.dices.players[player.label] = 0

            let emojiValue = Number.parseInt('0x' + (valueStart++).toString(16))
            let emoji = String.fromCodePoint(emojiValue)
            reactions[emoji] = player.label
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
                // TODO timing in variable
                const collector = message.createReactionCollector(filter, { time: 60000 });

                // handle click on reaction
                collector.on('collect', (reaction: MessageReaction, user: User) => {
                    // manage multiple player on the same reaction
                    if (reaction.count > 2) {
                        this.checkMultiplayerOnReactions(reaction, message);
                        return
                    }

                    this.associatePlayerFromEmoji(reactions, reaction.emoji.name, game, user)

                    // check if everybody is selected => ask the cci
                    let result = this.checkAllPlayersAssociated(game)
                    if (result.isOk) {
                        // cleanup
                        message.reactions.removeAll().catch(console.error)

                        // ask to each player the cci
                        let userIds = []
                        let msg = _.values(game.players).map((player: Player) => {
                            userIds.push(player.userId)
                            return player.label + ': ' + NiceMessage.notify(player.userId)
                        })

                        this.gameManager.setGame(game)

                        message.channel
                            .send(
                                NiceMessage.wrap(
                                    'Please ' + msg.join(',') + '. Give me your minde value for the CCi',
                                    NiceMessage.QUESTION
                                )
                            )
                            .then(() => this.updateMindFromResponse(userIds, message, game));
                    }
                });

                // handle double click on a reaction
                collector.on('remove', (reaction: MessageReaction, user: User) => {
                    // find player
                    let playerLabel = reactions[reaction.emoji.name];

                    // we search to be sure to not be catched by keys
                    let player = _.values<Player>(game.players).find((player: Player) => player.label === playerLabel)

                    // remove association
                    if (player) {
                        // don't lose it
                        if (isNullOrUndefined(game.players[player.label]) && !isNullOrUndefined(game.players[player.userId]) && game.players[player.userId].label == playerLabel) {
                            game.players[player.label] = player
                            game.players[player.userId] = undefined
                        }
                        player.userId = undefined
                    }
                });

                collector.on('end', () => {
                    // check if all player are associate
                    let result = this.checkAllPlayersAssociated(game)
                    if (result.isErr) {
                        let msg = NiceMessage.wrap(
                            'It appears some players have not been choose "' +
                            result.error.val.join(', ') + "\n" +
                            'Please restart the selection 😭',
                            NiceMessage.ERROR
                        )

                        if (result.error.val.length == 0) {
                            msg = NiceMessage.wrap(
                                'Some nasty player take two, so you need to restart the selection 😭',
                                NiceMessage.ERROR
                            )
                        }
                        message.channel.send(msg);
                        this.gameManager.removeGame(game);
                    }

                    // remove reaction, because they need to answer faster!!!!
                    message.reactions.removeAll()
                        .catch(console.error)

                    console.debug('end reaction collection')
                })
            });

        return reply;
    }

    private associatePlayerFromEmoji(reactions: {}, emoji: string, game: Game, user: User) {
        // find player
        let playerLabel = reactions[emoji];

        // we search to be sure to not be catched by keys
        let player = _.values<Player>(game.players).find((player: Player) => player.label === playerLabel)
        if (player) {
            // define the association with the player id
            player.userId = user.id
            // replace the key element
            game.players[player.userId] = player
            delete game.players[playerLabel]
        }
    }

    private updateMindFromResponse(userIds: string[], message: Message, game: Game): void {
        // take all next response and update mind
        const filter = m => userIds.includes(m.author.id);
        message.channel.awaitMessages(filter, { time: 60000, max: userIds.length, errors: ['time'] })
            .then(messages => {
                messages.each((message: Message) => {
                    let mind = parseInt(message.content);
                    if (isNaN(mind)) {
                        // skip ;)
                        return;
                    }

                    let player = game.playerByUserId(message.author.id)
                    if (player) {
                        player.mind = mind;
                    }
                    this.gameManager.setGame(game)
                });
            })
            .catch(() => {
                let players = _.values(game.players).filter((player: Player) => {
                    return isNullOrUndefined(player.mind);
                });
                // oops... something was wrong
                if (players.length > 0) {
                    message.channel.send(NiceMessage.wrap('Some player didn\'t response properly. Use ' + this.prefix + 'set mind X (X is the value of your mind)', NiceMessage.INFO));
                }
            });
    }

    private checkAllPlayersAssociated(game: Game): Result<string[], ValueError<string[]>> {
        let undefinedPlayers: string[] = [];
        _.values(game.players).forEach((player: Player) => {
            if (isNullOrUndefined(player.userId)) {
                undefinedPlayers.push(player.label);
            }
        });

        if (undefinedPlayers.length > 0) {
            return Result.err(new ValueError(undefinedPlayers))
        }
        else {
            if (!game.isReady()) {
                return Result.err(new ValueError(undefinedPlayers))
            }
            return Result.ok(undefinedPlayers)
        }
    }

    private checkMultiplayerOnReactions(reaction: MessageReaction, message: Message): void {
        reaction.users.fetch().then((users: Collection<string, User>) => {
            let mentions = users.map((user: User) => {
                return NiceMessage.notify(user.id);
            });

            message.channel.send(
                NiceMessage.wrap(
                    'It appears several player choose the same reaction "' +
                    reaction.emoji.name +
                    '"... ' + mentions.join(', ') + "\n" +
                    'Please select only one!',
                    NiceMessage.ERROR
                )
            );
        });
    }
}

class ValueError<T> extends Error {
    public val: T;
    public constructor(val: T) {
        super()
        this.val = val
    }
}
