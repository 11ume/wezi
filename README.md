<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    wezi is a small, simple and expressive library
    <br>
    to create a e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶s  robust web services like polar bears!. 
<p>
    
<br>

> Features

<br>

* **Small** only contains what you will need
* **Fast** high performance (even JSON parsing is opt-in)  
* **Clean** thinked for implement the best practices
* **Async** fully asynchronous, implements enhanced flow handlers
* **Functional** functional programing friendly
* **Intuitive** has features similar to other popular projects

<br>


### Usage

<br>

<div align="right">
    <img src="https://github.com/11ume/wezi-assets/blob/main/hi2.png?raw=true" width="200" height="auto"/>
</div>

> Say hello

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, i'm small polar bear!'
const w = wezi(hello)
listen(w(), 3000)
```

<br>


> Send and receive messages


```ts
import wezi, { Context, listen } from 'wezi'
import { json } from 'wezi-receive'

type Bear = {
    name: string
    type: string 
}

const locate = (type: string) => ({
    'polar': 'North pole',
    'grezzly': 'Yellowstone National Park'
})[type]

const find = async (c: Context) => {
    const bear = await json<Bear>(c)
    const location = locate(bear.type)
    if (location) return `The ${bear.name} lives in ${location}`
    return null
}

const w = wezi(find)
listen(w(), 3000)
```
