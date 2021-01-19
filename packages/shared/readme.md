#### wezi-shared

#### Share properies between multiple handlers whiout side effects

> This module use a Weakmap object to store a volatile value like the readable stream http Request, when request is destroyed the property is garbage collected, whiout posibilities of some memory leak. 


```ts
import wezi, { Context, listen } from 'wezi'
import { shared } from 'wezi-shared'

type Sharable = {
    session: string
    user: {
        name: string
        surname: string
    }
}

const pass = (c: Context) => {
    const sd = shared.set<Sharable>(c)
    sd.set('session', '123')
    sd.set('user', {
        name: 'foo'
        , surname: 'bar'
    })
    c.next()
}    

const greet = (c: Context) => {
    const sd = shared.get<Sharable>(c)
    const user = sd.get('user')
    const session = sd.get('session')
    return `session: ${session} ${user.name} ${user.surname}`
}

listen(wezi(pass, greet))

```

