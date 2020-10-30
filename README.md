<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>


<br>

**Small** and **expressive** http server

<br>


> **why?** Wizi is small but powerful, the idea behind it is to create robust http servers like polar bear, is expressive and easy to use. 

<br>


### Usage

<br>

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi!'
const w = wezi(hello)
listen(w(), 3000)
```
