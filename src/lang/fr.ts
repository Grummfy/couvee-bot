
export default {
    error: {
        no_game_found: 'Pas de partie en cours, pour en démarer une, faite "' + process.env.PREFIX + 'start Xplayer" où X est le nombre de joueurs.',
        no_player_found: 'Joueur non-trouvé...',
    },
    help: {
        default: (cmd: string) => '**' + cmd + '** fait quelque chose, mais la flemme de documenter...',
        ping: (cmd: string) => '**' + cmd + '** réponds pong, a pour but de tester que le bot fonctionne correctemement',
        help: (cmd: string) => '**' + cmd + '** affiche le message d\'aide ;)',
        about: (cmd: string) => '**' + cmd + '** quelques informations sur moi-même',
        stats: (cmd: string) => '**' + cmd + '** donne les dés disponibles pour chaque joueurs',
        start: (cmd: string) => '**' + cmd + ' Xplayer** ou **Xp** démarre le jeu pour X joueurs.' + "\n"
                + 'Une fois démarrer, les joueurs doivents choisir une des réactions (smiley) disponible pour s\'associer dans le jeu.' + "\n"
                + 'Ensuite, le bot, demandera la valeur d\'instinct pour chacun des joueurs.' + "\n",
        remove: (cmd: string) => '**' + cmd + '**: agis de manière similaire à la commande d\'ajout, mais enlève des dès de la pioche.',
    },
    cmd: {
        stats: {
            title: 'Stats à propos de la CC',
            neutral: 'Neutre',
            total: 'Total',
        },
        start: {
            react: [
                'Clic sur un emoji de réaction pour être associé a un joueur',
                'Joueurs: ',
            ],
        },
    }
};