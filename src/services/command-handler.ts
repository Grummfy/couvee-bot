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
    private handlers: Array<Command>;

    private store: Store;

    private gameManager: GameManager;

    public constructor(
        @inject(TYPES.Store) store: Store
    ) {
        this.handlers = new Array();
        this.store = store;
        this.gameManager = new GameManager(this.store);
    }

    public addHandler(command: Command, bot: Bot) {
        this.handlers.push(command);
        command.registered(this, this.gameManager, bot);
    }

    public getHandlers(): Command[] {
        return this.handlers;
    }

    public handle(message: Message): Promise<Message | Message[]> {
        for (let handler of this.handlers) {
            console.debug('Handled by: ' + handler.name);
            if (handler.isHandled(message)) {
                return handler.handle(message);
            }
        }
        return Promise.reject();
    }
}
