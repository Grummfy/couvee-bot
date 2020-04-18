import { Store } from "./store"
import { Game } from "../game/game"
import * as _ from "lodash"

export class GameManager {
    private store: Store
    private games = {}

    public constructor(store: Store) {
        this.store = store;
    }

    public getGame(guildId: string, channelId: string): Game {
        let key = this.keyFromIds(guildId, channelId);
        if (_.has(this.games, key)) {
            return this.games[key];
        }

        let game = new Game
        if (this.store.restore(key, game)) {
            this.games[key] = game;

        }

        return game;
    }

    public setGame(game: Game) {
        let key = this.keyFromGame(game)
        this.games[key] = game
        this.store.store(key, game)
    }

    public keyFromGame(game: Game): string {
        return this.keyFromIds(game.guildId, game.channelId);
    }

    private keyFromIds(guildId: string, channelId: string): string {
        return guildId + '_' + channelId;
    }
}
