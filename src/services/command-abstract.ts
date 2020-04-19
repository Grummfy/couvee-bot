import { Message } from "discord.js";
import { Command } from "../contracts/Command";
import { injectable } from "inversify";
import { CommandHandler } from "./command-handler";
import { GameManager } from "./game-manager";
import { Bot } from "../bot";

@injectable()
export abstract class CommandAbstract implements Command {
    public prefix: string
    public abstract name: string
    
    protected commandHandler: CommandHandler
    protected gameManager: GameManager
    protected bot: Bot

    public help(): string {
        return this.prefix + this.name + ' do something, but I\'m too lazy to document it!'
    }

    public isHandled(message: Message): boolean {
        return message.content.startsWith(this.prefix + this.name)
    }

    public abstract handle(message: Message): Promise<Message | Message[]>;

    public registered(commandHandler: CommandHandler, gameManager: GameManager, bot: Bot)
    {
        this.commandHandler = commandHandler;
        this.gameManager = gameManager;
        this.bot = bot;
    }
}
