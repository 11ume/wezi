import { Options as GetRawBodyOptions } from 'raw-body'

export interface Receive {
    json: <T>(options?: GetRawBodyOptions) => Promise<T>
    text: (options?: GetRawBodyOptions) => Promise<string>
    buffer: (options?: GetRawBodyOptions) => Promise<Buffer | null>
}
