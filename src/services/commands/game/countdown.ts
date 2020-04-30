import { Message } from 'discord.js'
import { CommandAbstract } from '../../command-abstract'
import { Result } from '@badrap/result'
import { isNullOrUndefined } from 'util'
import { NiceMessage } from '../../../helper/nice-message'

export class CountDownHandler extends CommandAbstract {
    public name = 'countdown'

    public handle(message: Message): Promise<Message | Message[]> {
        let result = this.extractValues(message)

        if (result.isErr) {
            return message.reply(this.commandHandler.getTranslator().cmd.countdown.error.bad_regex)
        }

        let val = this.cutValues(result.unwrap())

        if (val.length <= 0) {
            return message.reply(this.commandHandler.getTranslator().cmd.countdown.error.no_value)
        }

        val.forEach(counter => {
            setTimeout(() => {
                message.channel.send(
                    NiceMessage.wrap(
                        this.commandHandler.getTranslator().cmd.countdown.still_time(counter),
                        NiceMessage.COLOR_DARK_VIVID_PINK
                    )
                )
            }, (result.unwrap() - counter) * 1000)
        })

        setTimeout(() => {
            message.channel.send(
                NiceMessage.wrap(
                    this.commandHandler.getTranslator().cmd.countdown.end_timer,
                    NiceMessage.ERROR
                )
            )
        }, result.unwrap() * 1000)

        return message.reply('enjoy!')
    }

    protected extractValues(message: Message): Result<number, Error> {
        // extract operations
        let regex = new RegExp('^' + this.prefix + this.name + '(?<time>\\s*[0-9]*)$')
        let matched = message.content.trim().match(regex)
        if (isNullOrUndefined(matched) || isNullOrUndefined(matched.groups)) {
            return Result.err(new Error())
        }

        let value = matched.groups.time ? Number.parseInt(matched.groups.time) : 0
        if (isNaN(value)) {
            return Result.err(new Error())
        }

        return Result.ok(value)
    }

    protected cutValues(value: number): number[] {
        let countdown: number[] = []

        // hours
        if (value > 3600) {
            let hours = Math.floor(value / 3600)
            if (hours > 5) {
                return []
            }

            // change unit => -1
            value -= ((hours - 1) * 3600)
            for (let i = 1; i <= hours; i++) {
                countdown.push(i * 3600)
            }
        }

        // less than 15 minutes
        if (value > 900) {
            let quarters = Math.floor(value / 900)
            value -= (quarters * 900)
            countdown.push(900)
        }

        // less than 5 minutes
        if (value > 300) {
            let fiveMinutes = Math.floor(value / 300)
            value -= (fiveMinutes * 300)
            countdown.push(300)
        }

        // less than 1 minutes
        if (value > 60) {
            let minutes = Math.floor(value / 60)
            // change unit => -1
            value -= ((minutes - 1) * 60)
            countdown.push(60)
        }

        // less than 10 seconds
        if (value > 10) {
            let tenSeconds = Math.floor(value / 10)
            // let countdown last 10 seconds
            value -= ((tenSeconds - 1) * 10)
            countdown.push(10)
        }

        if (value > 10) {
            value = 9
        }

        for (let i = 1; i <= value; i++) {
            countdown.push(i)
        }

        countdown.sort((a, b) => a-b)

        return countdown
    }
}
