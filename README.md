<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>


<br>

<p align="center">
    small and expressive 
    <br>
    http server
<p>
    
<br>

> **why?** 
<br>
Wizi is small but powerful, focused on the *YAGNI* principle "You aren't gonna need it", each part of his code is modular, useful, simple and easy to understand, you can create robust http servers like a polar bear. 

<br>


### Usage

<br>

<div align="right">
    <img src="https://github.com/11ume/wezi-assets/blob/main/hi2.png?raw=true" width="200" height="auto"/>
</div>

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, i'm small polar bear!'
const w = wezi(hello)
listen(w(), 3000)
```
