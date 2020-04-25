import { Store } from './store'
import { Game } from '../game/game'
import * as _ from 'lodash'
import { Message } from 'discord.js'

export class GameManager {
    private store: Store
    private games = {}

    public constructor(store: Store) {
        this.store = store;
    }

    public getGameFromMessage(message: Message): Game {
        return this.getGame(message.guild.id, message.channel.id)
    }

    public getGame(guildId: string, channelId: string): Game {
        let key = this.keyFromIds(guildId, channelId);
        if (_.has(this.games, key)) {
            return this.games[key]
        }
        
        /*

        let game = new Game
        if (this.store.restore(key, game)) {
            this.games[key] = game;
        }
        return game;
        // XXX well I don't want a promise here, so we are fuked ...
        */

        return undefined;
    }

    public setGame(game: Game) {
        let key = this.keyFromGame(game)
        this.games[key] = game
        this.store.store(key, game)
    }

    public keyFromGame(game: Game): string {
        return this.keyFromIds(game.guildId, game.channelId)
    }

    public removeGame(game: Game) {
        let key = this.keyFromGame(game)
        delete this.games[key]
        this.store.remove(key)
    }

    private keyFromIds(guildId: string, channelId: string): string {
        return guildId + '_' + channelId
    }
}
