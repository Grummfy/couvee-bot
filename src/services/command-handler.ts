import { Message } from "discord.js";
import { Command } from "../contracts/Command";
import { injectable, inject } from "inversify";
import { Store } from "./store";
import { Bot } from "../bot";
import { GameManager } from "./game-manager";
import { TYPES } from "../types";

/**
 * Communication bus to dispach command alongs the bot
 */
@injectable()
export class CommandHandler {
    private handlers: Array<Command>

    private store: Store

    private gameManager: GameManager

    private prefix: string

    public constructor(
        @inject(TYPES.Store) store: Store,
        @inject(TYPES.Prefix) prefix: string
    ) {
        this.handlers = new Array()
        this.store = store
        this.gameManager = new GameManager(this.store)
        this.prefix = prefix
    }

    public addHandler(command: Command, bot: Bot) {
        command.prefix = this.prefix
        this.handlers.push(command)
        command.registered(this, this.gameManager, bot)
    }

    public getHandlers(): Command[] {
        return this.handlers
    }

    public getPrefix(): string {
        return this.prefix
    }

    public handle(message: Message): Promise<Message | Message[]> {
        // check all command handler and if it accept the command process it, and leave
        for (let handler of this.handlers) {
            if (handler.isHandled(message)) {
                console.debug('Handled by: ' + handler.name)
                return handler.handle(message)
            }
        }
        return Promise.reject()
    }
}
