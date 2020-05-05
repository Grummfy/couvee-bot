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

    public getGameFromMessage(message: Message): Promise<Game> {
        return this.getGame(message.guild.id, message.channel.id)
    }

    public getGameFromMessageAsync(message: Message): Promise<Game> {
        return this.getGame(message.guild.id, message.channel.id)
    }

    public getGame(guildId: string, channelId: string): Promise<Game> {
        let key = this.keyFromIds(guildId, channelId);
        if (_.has(this.games, key)) {
            return new Promise((resolve, reject) => {
                resolve(this.games[key])
                return this.games[key]
            })
        }
        
        let game = new Game()
        return this.store.restore(key, game)
            .then((isOk: boolean) => {
                if (isOk) {
                    this.games[key] = game
                }
                return game
            })
            .catch(() => {
                return game
            })
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
