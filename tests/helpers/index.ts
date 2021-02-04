import http from 'http'
import listen from 'test-listen'
import wezi from 'wezi'
import { lazyComposer } from 'wezi-composer'
import { ComposerHandler, Handler } from 'wezi-types'

export function server(...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function server(...handlers: any[]) {
    const compose = wezi(...handlers)
    const run = compose(lazyComposer)
    return listen(http.createServer(run))
}

