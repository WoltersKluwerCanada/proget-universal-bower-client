declare interface Callback {
    (err: Error | null, data: string | {} | null): void;
}
