<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    Wezi is a simple, small and expressive library
    <br>
    to create a e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶s  robust web services like polar bears!. 
<p>

<br>

<div align="center"> 
    
[![ci status](https://img.shields.io/github/workflow/status/11ume/wezi/ci?style=flat&colorA=000000&colorB=000000)](https://github.com/11ume/wezi/actions?query=workflow%3Aci)
[![js-standard-style](https://img.shields.io/badge/code%20style%20-standard-standard?style=flat&colorA=000000&colorB=000000)](http://standardjs.com)
[![codecov](https://img.shields.io/badge/coverage%20-☂-☂?style=flat&colorA=000000&colorB=000000)](https://codecov.io/gh/11ume/wezi/branch/main)
[![discord shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=92E8FF)](https://discord.com)

</div>
    
<br>

> Features

<br>

* **Small** Only contains essential features.
* **Fast** Hight performance (even JSON parsing is opt-in).  
* **Clean** Thinked for implement the best practices.
* **Async** Fully asynchronous, implements enhanced flow handlers.
* **Functional** Is functional programing friendly.  
* **Friendly** Has features similar to other popular projects.
* **Safe** Is designed from scratch to work with Typescript.

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

> Say hello

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, i'm a small polar bear!'
const w = wezi(hello)
listen(w(), 3000)
```

<br>


> Simple send and receive messages


```ts
type Bear = {
    name: string
    type: string 
}

const locate = (type: string) => ({
    'polar': 'North pole',
    'grezzly': 'Yellowstone National Park'
})[type]
```

```ts
import wezi, { Context, listen } from 'wezi'
import { json } from 'wezi-receive'

const find = async (c: Context) => {
    const bear = await json<Bear>(c)
    const location = locate(bear.type)
    if (location) return `The ${bear.name} lives in ${location}`
    return null
}

const w = wezi(find)
listen(w(), 3000)
```

<br>


> Using middlewares


```ts

// bear.ts

export type Bear = {
    type: string
    location: string
}

const bears: Bear[] = [
    {
        type: 'polar',
        location: 'North pole'
    },
    {
        type: 'grezzly', 
        location: 'Yellowstone National Park'
    }
]

export default bears
```

```ts
import wezi, { listen } from 'wezi'
import router, { ContextRoute, get } from 'wezi-router'
import bears, { Bear } from './bear'

const getAll = (): Bear[] => bears
const getById = ({ params }: ContextRoute<Pick<Bear,'type'>>): Bear => params.type 
    ? bears.find((bear) => bear.type === params.type) 
    : null 

const r = router(
    get('/bears', getAll)
    , get('/bears/:type', getById)
)

const w = wezi(r)
listen(w(), 3000)
```
