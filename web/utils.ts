export type ArrayElementType<A extends ReadonlyArray<any>> = A extends ReadonlyArray<infer T>? T : never

export function assertUnreachable(value: never): never {
    console.log('unhandled value', value);
    return undefined as never;
}
