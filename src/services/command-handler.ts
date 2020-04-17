import { Message } from "discord.js";
import { Command } from "../contracts/Command";
import { HelpHandler } from "./commands/help";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";

@injectable()
export class CommandHandler {
    private handlers: Array<Command>;

    private helpHandlerCommand: HelpHandler;

    public constructor(@inject(TYPES.HelpHandler) helpHandler: HelpHandler) {
        this.handlers = new Array();
        this.helpHandlerCommand = helpHandler;
    }

    public addHandler(command: Command) {
        this.handlers.push(command);
    }

    handle(message: Message): Promise<Message | Message[]> {
        if (this.helpHandlerCommand.isHandled(message)) {
            return this.helpHandlerCommand.showHelp(message, this.handlers);
        }

        for (let handler of this.handlers) {
            console.log('Handled by: ' + handler.name);
            if (handler.isHandled(message)) {
                return handler.handle(message);
            }
        }
        return Promise.reject();
    }
}
