import http from 'http'
import listen from 'test-listen'
import wezi from 'wezi'
import { lazyComposer, noLazyComposer } from 'wezi-composer'
import { ComposerHandler, Handler } from 'wezi-types'

export function server(lazy: boolean, ...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function server(lazy: boolean, ...handlers: any[]) {
    const compose = wezi(...handlers)
    const run = lazy ? compose(lazyComposer) : compose(noLazyComposer)
    return listen(http.createServer(run))
}

