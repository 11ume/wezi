#### wezi-shared

#### Share properties between multiple handlers whiout side effects

> This module use a Weakmap object to store a volatile value like the readable stream http Request, when request is destroyed the property is garbage collected, whiout posibilities of some memory leak. 


```ts
import wezi, { Context, listen } from 'wezi'
import { shared } from '..'

type Sharable = {
    user: {
        name: string
        surname: string
    }
}

const pass = (c: Context) => {
    const sd = shared<Sharable>(c)
    sd.set('user', {
        name: 'foo'
        , surname: 'bar'
    })
    c.next()
}

const greet = (c: Context) => {
    const sd = shared<Sharable>(c)
    const user = sd.get('user')
    return `user: ${user.name} ${user.surname}`
}

listen(wezi(pass, greet))
```

