export function* enumerate<T>(iterable: Iterable<T>, start: number = 0): Iterable<[number, T]> {
    for (const entry of iterable) {
        yield [start++, entry];
    }
}
