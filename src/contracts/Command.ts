import { Message } from "discord.js";

export interface Command {
    // the name of the command
    name: string;

    // give the string to match this help command
    help(): string;

    // does the command is supported by the handler
    isHandled(message: Message): boolean;

    // the handler of the command for the bot
    handle(message: Message): Promise<Message | Message[]>;
}
