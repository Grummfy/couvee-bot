import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { CommandHandler } from "./services/command-handler";

import { HelpHandler } from "./services/commands/help";
import { AboutHandler } from "./services/commands/about";
import { PingFinder } from "./services/commands/ping-finder";

import { StartGameHandler } from "./services/commands/game/start";
import { SetHandler } from "./services/commands/game/set";
import { EndGameHandler } from "./services/commands/game/end";
import { RollGameHandler } from "./services/commands/game/roll";
import { AddDiceHandler } from "./services/commands/game/add";
import { RemoveDiceHandler } from "./services/commands/game/remove";
import { StatGameHandler } from "./services/commands/game/stats";

/**
 * Bopt class that handle the message and dispatch to command throught the command handler bus
 */
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
        // register all the commands
        this.registerHandler()

        this.client.on('error', console.error);

        // show help tips
        this.client.on("ready", () => {
            this.client.user.setActivity('La Couvée: ' + this.handler.getPrefix() + 'help')
        })

        // catch message event
        this.client.on('message', (message: Message) => {
            if (message.author.bot || message.channel.type === 'dm') {
                console.debug('Ignoring bot & dm message!')
                return;
            }

            console.debug("Message received! Contents: ", message.content);

            // send to bus
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
        this.handler.addHandler(new HelpHandler, this);
        this.handler.addHandler(new AboutHandler, this);
        this.handler.addHandler(new PingFinder, this);
        this.handler.addHandler(new StartGameHandler, this);
        this.handler.addHandler(new EndGameHandler, this);
        this.handler.addHandler(new RollGameHandler, this);
        this.handler.addHandler(new AddDiceHandler, this);
        this.handler.addHandler(new RemoveDiceHandler, this);
        this.handler.addHandler(new StatGameHandler, this);
        this.handler.addHandler(new SetHandler, this);
    }
}
