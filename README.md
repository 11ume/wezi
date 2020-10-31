<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    wezi is a small, simply and expressive library
    <br>
    to create a e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶s  robust web services like polar bear!. 
<p>
    
<br>

> Features

<br>

* **Fast** high performance
* **Small** only contains what you will need
* **Easy** easy to learn  
* **Async** fully asynchronous, implements enhanced middlewares
* **Clean** thinked for implement the best practices
* **Intuitive** his appearance is similar to others popular libraries

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
