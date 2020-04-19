import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { Storable } from "../contracts/Storable";
import Keyv = require('keyv');

@injectable()
export class Store {
    private keyV: Keyv;

    constructor(
        @inject(TYPES.DB_DSN) dsn: string
    ) {
        this.keyV = new Keyv(dsn, { namespace: 'couvee-bot' });

        // Handle DB connection errors
        this.keyV.on('error', err => console.error('Connection to keyV error', err));
    }

    public store(key: string, storable: Storable) {
        let data = storable.toStorage();

        this.keyV.set(key, data);
    }

    public remove(key: string) {
        this.keyV.delete(key)
    }

    public restore(key: string, storable: Storable): boolean {
        let data = this.keyV.get(key);

        if (!data) {
            return true
        }

        // XXX if someone has an idea how to use a static call
        storable.fromStorage(data);

        return true;
    }
}
