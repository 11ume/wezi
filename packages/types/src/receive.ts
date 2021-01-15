export interface Body {
    text: () => Promise<string>
    json: <T>() => Promise<T>
    buffer: () => Promise<Buffer>
}
