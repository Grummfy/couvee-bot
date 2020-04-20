import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { Engine, shuffle, die } from 'random-js';
import container from "../../../inversify.config";
import { TYPES } from "../../../types";
import { isNullOrUndefined } from "util";
import * as _ from "lodash"
import { Game } from "../../../game/game";
import { Player } from "../../../game/player";
import { Result } from "@badrap/result";
import { NiceMessage } from "../../../helper/nice-message";

export class RollGameHandler extends CommandAbstract {
    public name = 'roll'
    private randomEngine: Engine

    private static readonly regexParts = [
        // cc dices
        '\\s*(?<dices>(\\+?\\s*([0-9]*)\\s*(g|i|n)\\s*)*)',
        // bonus dices
        '(?<bonus>\\+?\\s*([0-9]*))?',
        // end
        '$',
    ]

    private static readonly regexDicesParts = [
        // start
        '^',
        // value
        '(?<value>[0-9]*)\\s*',
        // group associated to the value
        '\\s*(?<group>(g|i|n))',
        '$',
    ]

    public constructor() {
        super()
        this.randomEngine = container.get<Engine>(TYPES.RandomEngine)
    }

    public isHandled(message: Message): boolean {
        return super.isHandled(message) || message.content.startsWith(this.prefix + this.name[0] + ' ')
    }

    public handle(message: Message): Promise<Message | Message[]> {
        // get usefull stuff like game & current player
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return message.reply('kO! mother wil eat you... grrr No game defined, start a new one with ' + this.prefix + 'start Xp')
        }

        let player = game.playerByUserId(message.author.id)
        if (!player) {
            return message.reply('argh')
        }

        //
        // extract requested roll
        let requestedDicesToRoll = this.extractRequestedDices(message, player, game)
        if (requestedDicesToRoll.isErr) {
            return message.reply(NiceMessage.wrap(requestedDicesToRoll.error.message, NiceMessage.ERROR))
        }
        let requestedDiceToRoll = requestedDicesToRoll.unwrap()

        let msg = 'you ask for some dices: '
        msg += requestedDiceToRoll.dices.n + ' neutral dice, '
        msg += requestedDiceToRoll.dices.g + ' group dice, '

        _.forIn(requestedDiceToRoll.dices.i, (value: number, playerLabel: string) => {
            let playerOfDice = game.playerByLabel(playerLabel)
            msg += requestedDiceToRoll.dices.i[ playerLabel ] + ' dice from ' + NiceMessage.notify(playerOfDice.userId) + ', '
        })

        message.reply(msg.slice(0, -2));

        //
        // take the requested dice to pool of dice to roll 
        let groupDice = this.getGroupOfDiceToRollFromRequest(game, requestedDiceToRoll)
        if (groupDice.isErr) {
            return message.reply(NiceMessage.wrap(groupDice.error.message, NiceMessage.ERROR))
        }
        let groupDiceToRoll = groupDice.unwrap()

        msg = 'you picked theses dices that will be rolled: '
        if (groupDiceToRoll.n > 0) {
            msg += groupDiceToRoll.n + ' neutral dice, '
        }
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            if (value > 0) {
                msg += value + ' from ' + NiceMessage.notify(game.playerByLabel(playerLabel).userId) + ', '
            }
        })
        message.reply(msg.slice(0, -2));

        //
        // roll the dices
        let roller = die(6);

        // roll neutral
        let result = { n: [], i: {} }
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            result.i[playerLabel] = []
        })

        for (let i = 0; i < (requestedDiceToRoll.bonus + groupDiceToRoll.n); i++) {
            result.n.push(roller(this.randomEngine))
        }

        // roll players
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            for (let i = 0; i < value; i++) {
                result.i[playerLabel].push(roller(this.randomEngine))
            }
        })

        // 3. put back all sucess from neutral & i/player
        let success = 5
        let neutralSucess = result.n.filter(value => value >= success).length
        game.dices.neutral += neutralSucess
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            game.dices.players[playerLabel] += result.i[playerLabel].filter(value => value >= success).length
        })

        msg = 'we have rolled: ' + "\n"
        if (result.n.length > 0) {
            msg += neutralSucess + ' [' + result.n.join(', ') + '] as neutral dice' + "\n"
        }
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            if (result.i[playerLabel].length > 0) {
                msg += result.i[playerLabel].filter(value => value >= success).length
                msg += ' [' + result.i[playerLabel].join(', ') + '] from ' + NiceMessage.notify(game.playerByLabel(playerLabel).userId) + "\n"
            }
        })

        return message.reply(msg.slice(0, -1));
    }
    
    private getGroupOfDiceToRollFromRequest(game: Game, requestedDiceToRoll: GroupOfDiceRequest): Result<GroupDiceToRoll, Error> {
        // init result structure
        let groupDice = new GroupDiceToRoll()
        groupDice.init(game)

        // check if request is possible
        if (!this.checkRequestedDiceIsPossible(game, requestedDiceToRoll)) {
            // well that's not possible!
            return Result.err(new Error('Not enought dices available!'))
        }

        // first take the specificaly requested dice from the pool
        groupDice.n += requestedDiceToRoll.dices.n
        _.forIn(requestedDiceToRoll.dices.i, (value: number, playerLabel: string) => {
            groupDice.i[playerLabel] += value
        })

        // remove requested dice from the available pool
        game.dices.neutral -= groupDice.n
        _.forIn(groupDice.i, (value: number, playerLabel: string) => {
            game.dices.players[playerLabel] -= value
        })

        // now take some dice randomly
        if (requestedDiceToRoll.dices.g > 0) {
            // build the pool of dice available
            let pool = Array(game.dices.neutral - groupDice.n).fill({ type: 'n' });
            _.forIn(game.dices.players, (playerDice: number, playerLabel: string) => {
                pool = pool.concat(Array(playerDice).fill({ type: 'i', label: playerLabel }));
            });

            // randomize the pool to swim in
            shuffle(this.randomEngine, pool);

            // take some dices ...
            let poolDice = pool.splice(0, requestedDiceToRoll.dices.g);
            poolDice.forEach(element => {
                if (element.type === 'n') {
                    // add to the dice we will roll
                    groupDice.n++;
                    // remove from the pool of available dices
                    game.dices.neutral--
                    return
                }

                // add to the dice we will roll
                groupDice.i[element.label]++;
                // remove from the pool of available dices
                game.dices.players[element.label]--
            });
        }

        return Result.ok(groupDice)
    }

    private extractRequestedDices(message: Message, player: Player, game: Game): Result<GroupOfDiceRequest, Error> {
        // explode message to group of values
        // trim to avoid exterm blank characters
        let regex = new RegExp('^' + this.prefix + '(' + this.name + '|' + this.name[0] + ')' + RollGameHandler.regexParts.join(''))
        let matched = message.content.trim().match(regex)
        if (isNullOrUndefined(matched) || isNullOrUndefined(matched.groups)) {
            return Result.err(new Error('Sorry I didn\'t understand your request'))
        }

        // extract number of dice to roll
        let requestedDiceToRoll = new GroupOfDiceRequest()

        requestedDiceToRoll.bonus = matched.groups.bonus ? Number.parseInt(matched.groups.bonus.replace('+', '')) : 0

        if (isNaN(requestedDiceToRoll.bonus)) {
            requestedDiceToRoll.bonus = 0;
        }

        // TODO extract i from other

        // extract dice groups
        let dices = matched.groups.dices.split('+');
        let regexDices = new RegExp(RollGameHandler.regexDicesParts.join(''));
        for (let dice of dices) {
            // trim to avoid exterm blank characters
            let matchedDice = dice.trim().match(regexDices);
            if (matchedDice && matchedDice.groups.group) {
                let val = matchedDice.groups.value ? Number.parseInt(matchedDice.groups.value) : 0;
                if (isNaN(val)) {
                    val = 0;
                }

                if (matchedDice.groups.group === 'i') {
                    requestedDiceToRoll.dices.i[player.label] = val
                    continue
                }
                requestedDiceToRoll.dices[matchedDice.groups.group] = val
            }
        }

        return Result.ok(requestedDiceToRoll)
    }

    private checkRequestedDiceIsPossible(game: Game, requestedDiceToRoll: GroupOfDiceRequest): boolean {
        // global level
        let availableDices = game.availableDice(false)
        let totalRequestedDice = requestedDiceToRoll.totalRequestedFromPool()
        if (availableDices < totalRequestedDice) {
            // well that's not possible!
            return false
        }

        // neutral level
        if (game.dices.neutral < requestedDiceToRoll.dices.n) {
            // too many dice asked => go to group
            let diff = requestedDiceToRoll.dices.n - game.dices.neutral
            requestedDiceToRoll.dices.g += diff
            requestedDiceToRoll.dices.n = game.dices.neutral
        }
        // character level
        _.forIn(game.dices.players, (available: number, playerLabel: string) => {
            // too many dice asked => go to group
            if (available < requestedDiceToRoll.dices.i[ playerLabel ]) {
                let diff = requestedDiceToRoll.dices.i[ playerLabel ] - available
                requestedDiceToRoll.dices.g += diff
                requestedDiceToRoll.dices.n = available
            }
        })

        return true
    }
}

class GroupDiceToRoll {
    public i = {}
    public n = 0

    public init(game: Game) {
        _.forIn(game.players, (player: Player) => {
            this.i[player.label] = 0
        })
    }
}

class GroupOfDiceRequest {
    public dices = {
        i: {},
        g: 0,
        n: 0,
    }
    public bonus = 0

    public totalRequestedFromPool(): number {
        return this.dices.n + this.dices.g + (_.values(this.dices.i).length > 0 ? _.values<number>(this.dices.i).reduce((sum, value) => sum + value) : 0)
    }
}
