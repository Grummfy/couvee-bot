import { Message } from 'discord.js'
import { Command } from '../contracts/Command'
import { injectable } from 'inversify'
import { CommandHandler } from './command-handler'
import { GameManager } from './game-manager'
import { Bot } from '../bot'
import { isNullOrUndefined } from 'util'

@injectable()
export abstract class CommandAbstract implements Command {
    public prefix: string
    public abstract name: string
    
    protected commandHandler: CommandHandler
    protected gameManager: GameManager
    protected bot: Bot

    public help(): string {
        if (isNullOrUndefined(this.commandHandler.getTranslator().help[ this.name ])) {
            return this.commandHandler.getTranslator().help['default'](this.prefix + this.name)
        }
        return this.commandHandler.getTranslator().help[ this.name ](this.prefix + this.name)
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
