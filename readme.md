<br>

<br>

<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    Wezi is small, minimalist, fast, adaptive, library 
    <br>
    to create web applications like polar bears. 
<p>

<br>

<div align="center">

[![ci status](https://img.shields.io/github/workflow/status/11ume/wezi/ci?style=flat&colorA=000000&colorB=000000)](https://github.com/11ume/wezi/actions?query=workflow%3Aci)
[![js-standard-style](https://img.shields.io/badge/code%20style%20-standard-standard?style=flat&colorA=000000&colorB=000000)](http://standardjs.com)
[![codecov](https://img.shields.io/badge/☂%20-coverage-☂?style=flat&colorA=000000&colorB=000000)](https://codecov.io/gh/11ume/wezi/branch/main)
[![discord shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=92E8FF)](https://discord.com)

</div>

<br>

> ⚠️ Wezi is currently under development.

<br>

> Features

<br>

* **Small** To be easy and fast to learn, easy to adapt.
* **Simple** Focused on simplicity, hides the complexity and respect the [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) principle.
* **High control** Extremely versatile, low level abstraction, you have the control.
* **Fast** High performance.
* **Focus opt-in**: All features are opt-in.  
* **Async** Implements an enhanced async control of handlers execution.

<br>

### Install

```bash
npm install wezi
```

<br>

### Usage

<br>

<div align="right">
    <img src="https://github.com/11ume/wezi-assets/blob/main/hi2.png?raw=true" width="200" height="auto"/>
</div>

## Functionalities preview
 

```ts
import wezi, { listen } from 'wezi'
import { text } from 'wezi-send'

const w = wezi(c => text(c, 'Hi!'))
listen(w())
```

<br>

> Simple rounting 


```ts
import wezi, { Context, listen } from 'wezi'
import router, { get } from 'wezi-router'
import { json } from 'wezi-send'
import createError from 'wezi-error'

type GetOneParams = {
    id?: string
}

const validateParams = (c: Context, params: GetOneParams) => params.id
    ? c.next(params.id)
    : c.panic(createError(400, 'the param "id", is required'))

const getOne = (c: Context, id: string) => json(c, {
    id
    , name: 'foo'
    , surname: 'bar'
})

const r = router(get('/users/:id', validateParams, getOne))
const w = wezi(r)
listen(w())
```

```bash
curl http://localhost:3000/users/123
```

<br>

> Share data between multiple handlers whiout side effects 


```ts
import wezi, { Context, listen } from 'wezi'
import { ok } from 'wezi-send'
import { shared } from 'wezi-shared'

type Shareable = {
    id: string
}

const session = (c: Context) => {
    const shareable = shared<Shareable>(c)
    shareable.set('id', 'foo')
    c.next()
}

const pass = (c: Context) => c.next()

const greet = (c: Context) => {
    const shareable = shared<Shareable>(c)
    const id = shareable.get('id')
    if (id === 'foo') return ok(c)
    c.panic()
}

const w = wezi(session, pass, greet)
listen(w())
```

<br>

> Note: If u are using **Javascript** remember enable ESM support in you package.json. [esm_enabling](https://nodejs.org/api/esm.html#esm_enabling)
