import http from 'http'
import listen from 'test-listen'
import wezi from 'wezi'
import { lazy } from 'wezi-composer'
import { ComposerHandler, Handler } from 'wezi-types'

export function server(...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function server(...fn: any[]) {
    const w = wezi(...fn)
    return listen(http.createServer(w(lazy)))
}

