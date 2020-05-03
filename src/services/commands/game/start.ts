import { Message, User, MessageReaction, Collection, GuildEmoji } from 'discord.js'
import { CommandAbstract } from '../../command-abstract'
import { Game } from '../../../game/game'
import { Player } from '../../../game/player'
import { NiceMessage } from '../../../helper/nice-message'
import * as _ from 'lodash'
import { isNullOrUndefined } from 'util'
import { Result } from '@badrap/result'

/**
 * Command to start a game:
 * * ask the number of players
 * * define the global CC available
 * * associate user and player
 * * start the game
 */
export class StartGameHandler extends CommandAbstract {
    public name = 'start'

    private readonly MAX_PLAYERS = 15;

    public async handle(message: Message): Promise<Message | Message[]> {
        // get the number of player in the game
        let regex = new RegExp('^' + this.prefix + this.name + ' ((p|player) ?(?<player1>[0-9]*)|(?<player2>[0-9]*) ?(p|player))$')

        let matched = message.content.match(regex)
        let numberOfPlayer = 0
        let reactions = {}
        if (!matched) {
            return message.reply('arghhhhhh....' + "\n\n" + this.help())
        }

        if (matched.groups.player1) {
            numberOfPlayer = Number.parseInt(matched.groups.player1)
        }
        else if (matched.groups.player2) {
            numberOfPlayer = Number.parseInt(matched.groups.player2)
        }

        // 15 is randomly choosen, it's just a number to have a limit
        if (numberOfPlayer <= 0 || numberOfPlayer > this.MAX_PLAYERS) {
            return message.reply(this.commandHandler.getTranslator().cmd.start.error.max_players)
        }

        let game = new Game();

        // XXX we need to slice to avoid object reference passing, this is shit!
        let msg: string[] = this.commandHandler.getTranslator().cmd.start.react.slice(0);

        // define players & player dice
        let emojis = await this.listOfEmojiesAvailaible(message)
        for (let i = 1; i <= numberOfPlayer; i++) {
            let player = new Player();
            player.label = 'player' + i

            // we init with label ;)
            game.players[player.label] = player

            game.dices.neutral += 4
            game.dices.players[player.label] = 0

            reactions[ emojis[i - 1].id ? emojis[i - 1].id : emojis[i - 1].name ] = player.label
            msg.push(emojis[i - 1].display + ' ' + player.label)
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
                const filter = (reaction: MessageReaction, user: User) => {
                    let emoji = reaction.emoji.name
                    if (!isNullOrUndefined(reaction.emoji.id)) {
                        emoji = reaction.emoji.id
                    }

                    return _.has(reactions, emoji) && !user.bot
                }

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

                    let emoji = reaction.emoji.name
                    if (!isNullOrUndefined(reaction.emoji.id)) {
                        emoji = reaction.emoji.id
                    }

                    this.associatePlayerFromEmoji(reactions, emoji, game, user)

                    // check if everybody is selected => ask the cci
                    let result = this.checkAllPlayersAssociated(game)
                    if (result.isOk) {
                        // cleanup
                        message.reactions.removeAll().catch(console.error)

                        // ask to each player the cci
                        this.processInstinctValue(game, message)
                    }
                });

                // handle double click on a reaction
                collector.on('remove', (reaction: MessageReaction, user: User) => {
                    let emoji = reaction.emoji.name
                    if (!isNullOrUndefined(reaction.emoji.id)) {
                        emoji = reaction.emoji.id
                    }

                    // find player
                    let playerLabel = reactions[ emoji ];

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
                            this.commandHandler.getTranslator().cmd.start.error.missing_players(result.error.val.join(', ')),
                            NiceMessage.ERROR
                        )

                        if (result.error.val.length == 0) {
                            msg = NiceMessage.wrap(
                                this.commandHandler.getTranslator().cmd.start.error.two_player_on_same_reaction,
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

    private processInstinctValue(game: Game, message: Message) {
        let userIds = []
        let msg = _.values(game.players).map((player: Player) => {
            userIds.push(player.userId)
            return player.label + ': ' + NiceMessage.notify(player.userId)
        })
        this.gameManager.setGame(game)
        message.channel
            .send(NiceMessage.wrap(this.commandHandler.getTranslator().cmd.start.ask_instinct(msg.join(',')), NiceMessage.QUESTION))
            .then(() => this.updateInstinctFromResponse(userIds, message, game))
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

    private updateInstinctFromResponse(userIds: string[], message: Message, game: Game): void {
        // take all next response and update instinct
        const filter = m => userIds.includes(m.author.id);
        message.channel.awaitMessages(filter, { time: 60000, max: userIds.length, errors: ['time'] })
            .then(messages => {
                messages.each((message: Message) => {
                    let instinct = parseInt(message.content);
                    if (isNaN(instinct)) {
                        // skip ;)
                        return;
                    }

                    let player = game.playerByUserId(message.author.id)
                    if (player) {
                        player.instinct = instinct;
                        game.modifyDiceNumber('i', instinct, player.userId, true)
                    }
                    this.gameManager.setGame(game)
                });
            })
            .catch(() => {
                let players = _.values(game.players).filter((player: Player) => {
                    return isNullOrUndefined(player.instinct);
                });
                // oops... something was wrong
                if (players.length > 0) {
                    message.channel.send(NiceMessage.wrap(this.commandHandler.getTranslator().cmd.start.set_instinct(this.prefix + 'set'), NiceMessage.INFO));
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
            
            let emoji = reaction.emoji.name
            if (!isNullOrUndefined(reaction.emoji.id)) {
                emoji = '<:' + reaction.emoji.name + ':' + reaction.emoji.id + '> '
            }

            message.channel.send(
                NiceMessage.wrap(
                    this.commandHandler.getTranslator().cmd.error.multiple_reaction_selected(emoji, mentions.join(', ')),
                    NiceMessage.ERROR
                )
            );
        });
    }

    private async listOfEmojiesAvailaible(message: Message): Promise<{ display: string, name: string, id: string }[]> {
        // create a list of emojies
        let emojies = []
        let valueStart = '😁'.codePointAt(0)
        for (let i = 0; i < this.MAX_PLAYERS; i++) {
            let emojiValue = Number.parseInt('0x' + (valueStart++).toString(16))
            emojies[i] = {
                name: String.fromCodePoint(emojiValue),
                display: String.fromCodePoint(emojiValue),
                id: null,
            }
        }

        // check emoji exist in guild (aka discord server)
        message.guild.emojis.cache.each((emoji: GuildEmoji) => {
            let matched = emoji.name.match(/lacouvee([0-9]*)/)
            if (isNullOrUndefined(matched)) {
                return
            }

            let emojiNumber = Number.parseInt(matched[1])
            if (Number.isNaN(emojiNumber) || (emojiNumber - 1) < 0) {
                return
            }

            emojies[emojiNumber - 1].name = emoji.name
            emojies[emojiNumber - 1].display = '<:' + emoji.name + ':' + emoji.id + '> '
            emojies[emojiNumber - 1].id = emoji.id
        })

        // create missing one
        // we only got 6 icon => 6 is the limit so ¯\_(ツ)_/¯
        let promises = []
        for (let i = 0; i < 6; i++) {
            if (emojies[i].emojiId === 0) {
                promises.push(
                    message.guild.emojis.create(process.cwd() + '/assets/emoji_' + (i + 1) + '.png', 'lacouvee' + (i + 1), { reason: 'bot La Couvée' })
                        .then((emoji: GuildEmoji) => {
                            emojies[i].name = emoji.name
                            emojies[i].display = '<:' + emoji.name + ':' + emoji.id + '> '
                            emojies[i].id = emoji.id
                        })
                        .catch(console.error)
                )
            }
        }

        // wait that all emojies have been created
        await Promise.all(promises)

        return emojies
    }
}

class ValueError<T> extends Error {
    public val: T;
    public constructor(val: T) {
        super()
        this.val = val
    }
}
