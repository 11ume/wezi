import { Readable } from 'stream'

export interface Send {
    ok: () => void
    empty: (statusCode?: number) => void
    json: <T>(statusCode: number, payload: T) => void
    text: (statusCode: number, payload: string | number) => void
    stream: (statusCode: number, payload: Readable) => void
    buffer: (statusCode: number, payload: Buffer) => void
}
