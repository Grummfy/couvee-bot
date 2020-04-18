export interface Storable {
    toStorage(): object;
    fromStorage(data);
}
