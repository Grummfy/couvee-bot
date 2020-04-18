import { Message } from "discord.js";
import { CommandHandler } from "../services/command-handler";
import { GameManager } from "../services/game-manager";
import { Bot } from "../bot";

export interface Command {
    // the name of the command
    name: string;

    // give the string to match this help command
    help(): string;

    // does the command is supported by the handler
    isHandled(message: Message): boolean;

    // the handler of the command for the bot
    handle(message: Message): Promise<Message | Message[]>;

    // indicate that the command is registred
    registered(commandHandler: CommandHandler, gameManager: GameManager, bot: Bot);
}
