
export default {
    error: {
        no_game_found: 'No game found, you start a new game with "' + process.env.PREFIX + 'start Xplayer" where X is the number of players.',
        no_player_found: 'No player found...',
    },
    help: {
        default: (cmd: string) => '**' + cmd + '** do something, but I\'m too lazy to document it!',
        ping: (cmd: string) => '**' + cmd + '** print pong response, mainly used to check if this working properly',
        help: (cmd: string) => '**' + cmd + '** display help message ;)',
        about: (cmd: string) => '**' + cmd + '** some information about myself',
        stats: (cmd: string) => '**' + cmd + '** give the actual stats about the number of dice available for each player',
        start: (cmd: string) => '**' + cmd + ' Xplayer** or **Xp** start the game for X players.' + "\n"
                + 'Once started, each player must choose one smiley from the available reactions.' + "\n"
                + 'Then the bot will ask for the instinct value of each of them.' + "\n",
        remove: (cmd: string) => '**' + cmd + '**: act simillary to add command, but to remove dice from the pool.',
        set: (cmd: string) => '**' + cmd + '** define some values like:' + "\n"
                + '• *instinct X @Y*: X is the value of the instinct of the character played by the player, Y is optional and is the mention of the player (@username) or yourself' + "\n"
                + '• *cci X @Y*: X is the value of the cci of the character played by the player, Y is optional and is the mention of the player (@username) or yourself' + "\n"
                + '• *ccn X*: X is the value of the ccn of the group of characters played' + "\n",
        end: (cmd: string) => '**' + cmd + '**: will end the game, wipe the memory and going to sleep!',
        add: (cmd: string) => '**' + cmd + '**: will add some dice in the pool:' + "\n"
                + '• *X i @Y*: X is the number of character dice of player Y(@username) to re-add (within the limit of availibilities)' + "\n"
                + '• *X i*: X is the number of character dice of yourself to re-add (within the limit of availibilities)' + "\n"
                + '• *X n*: X is the number of neutral dice to put in the pool of dices' + "\n",
        roll: (cmd: string) => '**' + cmd + '** will roll some dices, you can combine several possibilities:' + "\n"
                + '• *X*: roll X neutral dice that are bonus dices' + "\n"
                + '• *Xg*: roll X random dice taken randomly from the pool of the group' + "\n"
                + '• *Xn*: roll X neutral dice taken randomly from the pool of the group' + "\n"
                + '• *Xi*: roll X dice taken from the pool of the group, but only yours (if not enought, will take some ranom dice)' + "\n"
                + '• *Xg+Yi+Zn+A*: roll X random dice from the pool, Y individual dice, Z neutral dice and A bonus dices' + "\n"
                + 'When some kind of dice are not available, it will take some randomly... hehe' + "\n",
    },
    cmd: {
        about: {
            about: [
                'I\'m a bot created by Grummfy',
                'You can find me [online](https://github.com/Grummfy/couvee-bot.git) if you want to change me.',
                'My license is [AGPL v3](https://raw.githubusercontent.com/Grummfy/couvee-bot/master/LICENSE)',
                '',
                'This bot is an help for the rpg [La Couvée](http://editions-6napse.fr/#product-new-born)'
            ],
            version: (version: string) => 'Version: ' + version,
        },
        stats: {
            title: 'Stats about the CC',
            neutral: 'Neutral',
            total: 'Total',
        },
        start: {
            error: {
                max_players: 'arghh, the number of player is inadequat!',
                two_player_on_same_reaction: 'Some nasty player take two, so you need to restart the selection 😭',
                multiple_reaction_selected: (emoji: string, players: string) => 'It appears several player choose the same reaction "' + emoji + '"... ' + players + "\n" + 'Please select only one!',
                missing_players: (choosen: string) => 'It appears some players have not been choose "' + choosen + "\n" + 'Please restart the selection 😭',
            },
            react: [
                'Click on the reaction emoji to be associate to a player',
                'Players: ',
            ],
            ask_instinct: (players: string) => 'Please ' + players + '. Give me your instinct value',
            set_instinct: (cmd: string) => 'Some player didn\'t response properly. Use **' + cmd + ' instinct X** (X is the value of your instinct)',
        },
        roll: {
            error: {
                miss_match: 'Sorry I didn\'t understand your request',
                no_dice: 'Not enought dices available!',
            },
            asked_dices: (bonus: number, neutral: number, group: number) => 'you ask for some dices: ' +
                    '***' + bonus + '*** bonus dice added, ' +
                    '**' + neutral + '** neutral dice, ' + 
                    '**' + group + '** group dice, ',
            asked_player_dices: (dice: number, player: string) => '**' + dice + '** dice from ' + player + ', ',

            picked_dices: 'you picked theses dices that will be rolled: ',
            picked_neutral_dices: (dice: number) => dice + ' neutral dice, ',
            picked_player_dices: (dice: number, player: string) => dice + ' from ' + player + ', ',

            rolled_dices: 'we have rolled: ' + "\n",
            rolled_neutral_dices: (dice: number, values: string) => dice + ' [' + values + '] as neutral dice' + "\n",
            rolled_player_dices: (dice: number, values: string, player: string) => dice + ' [' + values + '] from ' + player + "\n",
        },
        set: {
            error: {
                bad_regex: 'Mother eat you!',
            },
        },
        add: {
            error: {
                bad_regex: 'Sorry I didn\'t understand your request',
            },
        },
    }
}
