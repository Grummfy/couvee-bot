import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { CommandHandler } from "./services/command-handler";
import { AboutHandler } from "./services/commands/about";
import { PingFinder } from "./services/commands/ping-finder";

@injectable()
export class Bot {
    private client: Client;
    private readonly token: string;
    private handler: CommandHandler;

    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.Token) token: string,
        @inject(TYPES.CommandHandler) handler: CommandHandler
    ) {
        this.client = client;
        this.token = token;
        this.handler = handler;
    }

    public listen(): Promise<string> {
        this.registerHandler()

        this.client.on('message', (message: Message) => {
            if (message.author.bot) {
                console.debug('Ignoring bot message!')
                return;
            }

            console.debug("Message received! Contents: ", message.content);

            this.handler.handle(message).then(() => {
                console.debug("Response sent!");
            }).catch((error) => {
                console.log("Response not sent.")
                console.error(error)
            })
        });

        return this.client.login(this.token);
    }

    private registerHandler()
    {
        this.handler.addHandler(new AboutHandler);
        this.handler.addHandler(new PingFinder);
    }
}
