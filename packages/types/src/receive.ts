import { Options as GetRawBodyOptions } from 'raw-body'

export interface Receive {
    text: (options?: GetRawBodyOptions) => Promise<string>
    json: <T>(options?: GetRawBodyOptions) => Promise<T>
    buffer: (options?: GetRawBodyOptions) => Promise<Buffer | null>
}
