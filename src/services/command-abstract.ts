import { Message } from "discord.js";
import { Command } from "../contracts/Command";
import { injectable } from "inversify";

@injectable()
export abstract class CommandAbstract implements Command {
    public abstract name: string;

    public help(): string {
        return this.name + ' do something, but I\'m too lazy to document it!'
    }

    public isHandled(message: Message): boolean {
        return message.content.search(this.name) >= 0;
    }

    public abstract handle(message: Message): Promise<Message | Message[]>;
}
