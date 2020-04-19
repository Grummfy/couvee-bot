import { Player } from "./player";
import { Storable } from "../contracts/Storable";
import * as _ from "lodash"
import { isNullOrUndefined } from "util";

export class Game implements Storable {
    // server or guild id
    public guildId: string;
    // channel id
    public channelId: string;
    // list of player (key userId, except at init where it's shitty)
    public players = {};
    // the states of the dices
    public dices = {
        // player by label instead of user id
        players: {},
        neutral: 0,
    };

    public isValid(): boolean {
        return !isNullOrUndefined(this.guildId) && !isNullOrUndefined(this.channelId);
    }

    public playerByUserId(userId: string): (Player | undefined) {
        return this.players[userId]
    }

    public playerByLabel(label: string): (Player | undefined) {
        return _.values<Player>(this.players)
            .filter((player: Player) => player.label === label)
            .shift()
    }

    public modifyDiceNumber(type: string, value: number, userId: string = undefined): boolean {
        if (type === 'i' && isNullOrUndefined(userId)) {
            return false
        }

        if (type === 'i') {
            let player = this.playerByUserId(userId)
            let newValue = value + this.dices.players[player.label]
            // avoid overflow and going under 0
            if (!player || newValue > player.mind || newValue < 0) {
                return false
            }

            this.dices.players[player.label] = newValue
        }

        if (type === 'n') {
            let newValue = value + this.dices.neutral
            // avoid going under 0
            if (newValue < 0) {
                return false
            }

            this.dices.neutral = newValue
        }
    }

    public toStorage(): object {
        let players = [];
        _.forIn(this.players, (player: Player) => players.push(player.toStorage()))

        return {
            guildId: this.guildId,
            channelId: this.channelId,
            players: players,
            dices: this.dices,
        };
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
