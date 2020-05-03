import { Player } from './player'
import { Storable } from '../contracts/Storable'
import * as _ from 'lodash'
import { isNullOrUndefined } from 'util'
import { GroupOfDiceRequest } from './dices/GroupOfDiceRequest'
import { Result } from '@badrap/result'
import { GroupDiceToRoll } from './dices/GroupDiceToRoll'
import { Engine, shuffle } from 'random-js'

export class Game implements Storable {
    // server or guild id
    public guildId: string
    // channel id
    public channelId: string
    // list of player (key userId, except at init where it's shitty)
    public players = {}
    // the states of the dices
    public dices = {
        // player by label instead of user id
        players: {},
        neutral: 0,
    }
    public lang: string

    public isValid(): boolean {
        return !isNullOrUndefined(this.guildId) && !isNullOrUndefined(this.channelId)
    }

    public isReady(): boolean {
        if (!this.isValid() || _.isEmpty(this.players)) {
            return false
        }

        let dead = false
        _.forIn(this.players, (player: Player, userId: string) => {
            if (dead) {
                return
            }

            // check player is matched to userId
            if (player.userId !== userId) {
                dead = true
                return
            }

            // check player exist in dice
            if (!_.has(this.dices.players, player.label)) {
                dead = true
                return
            }
        })

        if (_.values(this.dices.players).length !== _.values(this.players).length) {
            dead = true
        }

        return !dead
    }

    public playerByUserId(userId: string): (Player | undefined) {
        return this.players[userId]
    }

    public playerByLabel(label: string): (Player | undefined) {
        return _.values<Player>(this.players)
            .filter((player: Player) => player.label === label)
            .shift()
    }

    public modifyDiceNumber(type: string, value: number, userId: string = undefined, set: boolean): boolean {
        if (type === 'i' && isNullOrUndefined(userId)) {
            return false
        }

        if (type === 'i') {
            let player = this.playerByUserId(userId)
            if (!player) {
                return false
            }

            let newValue = set ? value  : (value + this.dices.players[player.label])
            // avoid overflow and going under 0
            if (newValue > player.instinct || newValue < 0) {
                return false
            }

            this.dices.players[player.label] = newValue
        }

        if (type === 'n') {
            let newValue = set ? value : value + this.dices.neutral
            // avoid going under 0
            if (newValue < 0) {
                return false
            }

            this.dices.neutral = newValue
        }

        return true
    }

    public availableDice(playersOnly: boolean): number {
        let available = _.values<number>(this.dices.players).reduce((sum, value) => sum + value)
        if (!playersOnly) {
            available += this.dices.neutral
        }

        return available
    }

    public changeLang(lang: string): void {
        this.lang = lang
    }

    public getGroupOfDiceToRollFromRequest(requestedDiceToRoll: GroupOfDiceRequest, translator: any, randomEngine: Engine): Result<GroupDiceToRoll, Error> {
        // init result structure
        let groupDice = new GroupDiceToRoll()
        groupDice.init(this)

        // check if request is possible
        if (!this.checkRequestedDiceIsPossible(requestedDiceToRoll)) {
            // well that's not possible!
            return Result.err(new Error(translator.cmd.roll.error.no_dice))
        }

        // first take the specificaly requested dice from the pool
        groupDice.n += requestedDiceToRoll.dices.n
        _.forIn(requestedDiceToRoll.dices.i, (value: number, playerLabel: string) => {
            groupDice.i[playerLabel] += value
        })

        // remove requested dice from the available pool
        this.dices.neutral -= groupDice.n
        _.forIn(groupDice.i, (value: number, playerLabel: string) => {
            this.dices.players[playerLabel] -= value
        })

        // now take some dice randomly
        if (requestedDiceToRoll.dices.g > 0) {
            // build the pool of dice available
            let pool = Array()
            // first put all neutral
            if (this.dices.neutral > 0) {
                pool = Array(this.dices.neutral).fill({ type: 'n' });
            }
            // then put all player dices
            _.forIn(this.dices.players, (playerDice: number, playerLabel: string) => {
                pool = pool.concat(Array(playerDice).fill({ type: 'i', label: playerLabel }));
            });

            // randomize the pool to swim in
            shuffle(randomEngine, pool);

            // take some dices ...
            let poolDice = pool.splice(0, requestedDiceToRoll.dices.g);
            poolDice.forEach(element => {
                if (element.type === 'n') {
                    // add to the dice we will roll
                    groupDice.n++;
                    // remove from the pool of available dices
                    this.dices.neutral--
                    return
                }

                // add to the dice we will roll
                groupDice.i[element.label]++;
                // remove from the pool of available dices
                this.dices.players[element.label]--
            });
        }

        return Result.ok(groupDice)
    }

    public checkRequestedDiceIsPossible(requestedDiceToRoll: GroupOfDiceRequest): boolean {
        // global level
        let availableDices = this.availableDice(false)
        let totalRequestedDice = requestedDiceToRoll.totalRequestedFromPool()

        if (availableDices < totalRequestedDice) {
            // well that's not possible!
            return false
        }

        // neutral level
        if (this.dices.neutral < requestedDiceToRoll.dices.n) {
            // too many dice asked => go to group
            let diff = requestedDiceToRoll.dices.n - this.dices.neutral
            requestedDiceToRoll.dices.g += diff
            requestedDiceToRoll.dices.n = this.dices.neutral
        }
        // character level
        _.forIn(this.dices.players, (available: number, playerLabel: string) => {
            // too many dice asked => go to group
            if (available < requestedDiceToRoll.dices.i[ playerLabel ]) {
                let diff = requestedDiceToRoll.dices.i[ playerLabel ] - available
                requestedDiceToRoll.dices.g += diff
                requestedDiceToRoll.dices.i[ playerLabel ] = available
            }
        })

        return true
    }

    public toStorage(): object {
        let players = [];
        _.forIn(this.players, (player: Player) => players.push(player.toStorage()))

        return {
            guildId: this.guildId,
            channelId: this.channelId,
            players: players,
            dices: this.dices,
        }
    }

    public fromStorage(data) {
        this.guildId = data.guildId
        this.channelId = data.channelId
        for (let row of _.values(data.players)) {
            let player = new Player()
            player.fromStorage(row)
            this.players[player.userId] = player
        }

        this.dices = data.dices
    }
}
