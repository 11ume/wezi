
<br>

<br>

<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    Wezi is a simple, small and expressive library
    <br>
    to create e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶s robust web applications and microservices like polar bears!. 
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

* **Simple** Only includes essential features.
* **Small** It's really small and modular.
* **Fast** High performance (even JSON parsing is opt-in).  
* **Async** Fully asynchronous, implements enhanced flow handlers.
* **Safe** Is designed from scratch to work with Typescript.
* **Middlwares** Implements a middleware logic.

<br>

**Wezi** is small and simple because are designed to work behind of an **API Gateway** or a **Reverse proxy**.
Most of the functionalities of other libraries similar to this, are usually redundant and you will probably never need to use them.

Respect the [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) principle. 

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


## Create

Create an instance of wezi whit a handler and then start http server to listen requests on port 3000. 


```ts
import wezi, { listen } from 'wezi'

const greet = () => 'Hi!'
const w = wezi(greet)
listen(w, 3000)
```


## Send data

You have two forms to send responses.
The  frist and most simple and natural is send a direct return.

<br>

By default a direct return emits a status code:

**200** succeeded, if you return a **[stringifyable](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/JSON/stringify)**  value. 

**204** No Content, if you return a **[null](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/null)** value.

**500** Internal Server Error, if an exception is thrown inside of the handler context.

<br>

### Direct returns

##### Direct returns of stringifyables.
  
An stringifyables value is a value can be procesed by the method JSON.stringify.

<br>

> Return string value. 

> Status code 200.

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, im a small polar bear!'
const w = wezi(hello)
listen(w, 3000)
```
<br>

> Returns empty body.

> Status code 204.

```ts
import wezi, { listen } from 'wezi'

const empty = () => null
const w = wezi(empty)
listen(w, 3000)
```
<br>

> Returns a JSON "{ "message": "Something wrong has happened" }".

> status code 500.
 
```ts
import wezi, { listen } from 'wezi'

const error = () => {
    throw Error('Something wrong has happened')
}

const w = wezi(error)
listen(w, 3000)
```
<br>

> Returns a JSON "{ "message": Bad Request }".

> status code 400.
 
```ts
import wezi, { listen } from 'wezi'
import { createError } from 'wezi-error'

const errorWhitStatusCode = () => {
   throw createError(400)
}

const w = wezi(errorWhitStatusCode)
listen(w, 3000)
```
<br>


##### Direct returns of promises  

You can directly return promises and they will be executed in a secure context.

```ts
import wezi, { listen } from 'wezi'

const delay = (time: number) => new Promise((r) => setTimeout(r, time))
const hello = async () => {
    await delay(2000)
    return 'Hi, im a polar bear!'
}

const w = wezi(hello)
listen(w, 3000)
```

<br>

### Functional returns

The second way to send responses is through the **send** object of **context**.
This object has functions to send more specific data types like streams and buffers.

<br>


```ts
import wezi, { Context, listen } from 'wezi'

const  enhanceYourCalm   = ({ send }:  Context) => send.buffer(420, Buffer.from('Enhance Your Calm ✌️'))
const w = wezi(enhanceYourCalm)
listen(w, 3000)

```

<br>

## Receive


> The payload of each messages is parsed in explicit form, this makes wezi really fast, since the type is not inferred in each request that is made.

<br>

### Receive JSON

Calling the receive.json function will perform a JSON.parse of the raw body of the incoming request.

```ts
import wezi, { Context, listen } from 'wezi'

type Bear = {
    type: string
    location: string
}

const locate = async ({ receive }: Context) => {
    const { type, location } = await receive.json<Bear>()
    return `The ${type} bear lives in ${location}`
}

const w = wezi(locate)
listen(w, 3000)

```
<br>


```bash
curl -X POST -H "Content-Type: application/json" -d '{ "type": "Polar", "location": "North Pole" }' http://localhost:3000
```

<br>

### Receive Buffer
Maybe for performance reasons you want to work directly with buffers whiout make a high cost parsing.

```ts
import wezi, { Context, listen } from 'wezi'

const locate = async ({ receive }: Context) => {
    const location = await receive.buffer()    
    return `Bear location ${location}`
}

const w = wezi(locate)
listen(w, 3000)
```
<br>

```bash
curl http://localhost:3000 -d 'North Pole'
```

<br>

### Receive Text

<br>

```ts
import wezi, { Context, listen } from 'wezi'

const greet = async ({ receive }: Context) => {
    const name = await receive.text() // "wezi"
    return `Hi ${name}!`
}

const w = wezi(greet)
listen(w, 3000)

```

<br>

**Note**: By default the wezi does not discriminate between HTTP methods, to achieve this you must use the **router** package.

<br>

## The context object

<br>

The context object is property is passed as argument to each handler. Contains only the essential elements that each handler needs to handle an incoming request and his response.


<br>

```ts
Context {
    req: IncomingMessage // http server request.
    res: ServerResponse // http server response.
    next: Next // function to pass to next handler.
    panic: Panic // function to stop the handlers stack execution flow.
    send: Send // object with functions to manage the response.
    receive: Receive // object with functions to manage the request data.
    actions: Actions // object with functional tools like redirect. 
    errorHandler: ErrorHandler // the default error handler.
}
```

<br>

## The data flow between handlers 

<br>

> Each handler must do two things in his execution, return a value and end the request, or pass to next handler using the **next** function. Also through the **next** function you can pass some value to the next handler.

<br>


```ts
import wezi, { Context, listen } from 'wezi'

const passName = ({ next }: Context) => next('John')
const greet = (_c: Context, name: string) => `Hi ${name}!`

const w = wezi(passName, greet)
listen(w, 3000)
```

<br>

```ts
import wezi, { Context, listen } from 'wezi'
import { createError } from 'wezi-error'

type Bear = {
    type: string
    location: string
}

const check = async ({ next, panic, receive }: Context) => {
    const bear = await receive.json<Bear>()
    if (bear.type && bear.location) {
        next(bear)
        return
    }
    panic(createError(400, 'Type and location are required'))
}

const locate = async (_c: Context, { type, location }: Bear) => `The ${type} bear lives in ${location}`
const w = wezi(check, locate)
listen(w, 3000)
```

<br>

*Passing values through the **next** function, is a very clear and intuitive way for handling the flow of data from one handler to other*.

<br>

### Let's stop for a moment.

The **next** function is used to pass from current handler to next, and it can also pass parameters.
The **panic** function is used to stop the sequence of execution of the stack of handlers.

When **panic** function is invoked, the **composer** immediately stops the sequence of handlers execution, and the system goes into a panic state 🔥, so the error passed into panic function will be controlled by the error handler function 🚒.


<br>

## Error handling

<br>

> By default each handler run inside a safe context, and are controlled by a default error handler, but you can define your own.

<br>

> Automatic error handling 

<br>


```ts
import wezi, { listen } from 'wezi'

const handler = () => {
    throw Error('Something wrong has happened')
}

const w = wezi(handler)
listen(w, 3000)
```

<br>

> Automatic error handling in promises 

<br>

```ts
import wezi, { listen } from 'wezi'

const handler = () => Promise.reject(new Error('Something wrong has happened'))
const w = wezi(handler)
listen(w, 3000)
```

<br>

> Error handling through panic function 

<br>

```ts
import wezi, { Context, listen } from 'wezi'

const handler = ({ panic }: Context) => panic(new Error('Something wrong has happened'))
const w = wezi(handler)
listen(w, 3000)
```

<br>

**Note**: All the errors that are emitted in production mode whitout some status code or error message, return a default error message like this:

<br>

```bash
curl http://localhost:3000 -v

HTTP/1.1 500 Internal Server Error
Content-Type: application/json charset=utf-8
{"message":"Internal Server Error"}
```

<br>


```ts
import wezi, { Context, listen } from 'wezi'
import { createError } from 'wezi-error'

const handler = ({ panic }: Context) => panic(createError(400, 'You custom error message'))
const w = wezi(handler)
listen(w, 3000)
```

<br>


```bash
curl http://localhost:3000 -v

HTTP/1.1 400 Bard Request
Content-Type: application/json charset=utf-8
{"message":"You custom error message"}
```

<br>

#### Defining your own error handler

<br>

```ts
import wezi, { Context, listen } from 'wezi'
import { createError, InternalError } from 'wezi-error'

const greet = ({ panic }: Context) => panic(createError(400))
const errorHandler = ({ send }: Context, error: InternalError) => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }
    send.json(status, payload)
}

const w = wezi(greet)
listen((req, res) => w(req, res, errorHandler), 3000)
```

```bash
curl http://localhost:3000 -v

HTTP/1.1 400 Bad Request
Content-Type: application/json charset=utf-8
{"message":"Bad Request"}
```
