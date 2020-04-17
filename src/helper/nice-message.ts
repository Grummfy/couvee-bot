export class NiceMessage {
    public static wrap(message: string, color: any = 3447003) {
        return {
            embed: {
                color: color,
                description: message
            }
        }
    }
}
