import { Player } from "./player";
import { Storable } from "../contracts/Storable";

export class Game implements Storable {
    // server or guild id
    public guildId: string;
    // channel id
    public channelId: string;
    // list of player
    public players: Player[] = [];
    // the states of the dices
    public dices = {
        players: {},
        neutral: 0,
    };

    public toStorage(): object {
        let players = [];
        for (let player of this.players) {
            players.push(player.toStorage());
        }

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
        this.players = data.players
        this.dices = data.dices
    }
}
