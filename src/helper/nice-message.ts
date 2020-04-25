
export class NiceMessage {
    // discord accept color as numeric value, we coudl use hexadecimal notation instead of base10,
    // it will be more readable... but all code came with non hexadecimal value, that's totally stupid ...
    // so we will keep that way hahaha
    public static readonly COLOR_DEFAULT = 0
    public static readonly COLOR_AQUA = 1752220
    public static readonly COLOR_GREEN = 3066993
    public static readonly COLOR_BLUE = 3447003
    public static readonly COLOR_PURPLE = 10181046
    public static readonly COLOR_GOLD = 15844367
    public static readonly COLOR_ORANGE = 15105570
    public static readonly COLOR_RED = 15158332
    public static readonly COLOR_GREY = 9807270
    public static readonly COLOR_DARKER_GREY = 8359053
    public static readonly COLOR_NAVY = 3426654
    public static readonly COLOR_DARK_AQUA = 1146986
    public static readonly COLOR_DARK_GREEN = 2067276
    public static readonly COLOR_DARK_BLUE = 2123412
    public static readonly COLOR_DARK_PURPLE = 7419530
    public static readonly COLOR_DARK_GOLD = 12745742
    public static readonly COLOR_DARK_ORANGE = 11027200
    public static readonly COLOR_DARK_RED = 10038562
    public static readonly COLOR_DARK_GREY = 9936031
    public static readonly COLOR_LIGHT_GREY = 12370112
    public static readonly COLOR_DARK_NAVY = 2899536
    public static readonly COLOR_LUMINOUS_VIVID_PINK = 16580705
    public static readonly COLOR_DARK_VIVID_PINK = 12320855

    public static readonly INFO = NiceMessage.COLOR_BLUE
    public static readonly ERROR = NiceMessage.COLOR_RED
    public static readonly QUESTION = NiceMessage.COLOR_GREEN

    public static wrap(message: string, color: any = NiceMessage.INFO) {
        return {
            embed: {
                color: color,
                description: message
            }
        }
    }

    public static notify(userId: string): string {
        return '<@' + userId + '>'
    }
}
