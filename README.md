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

Do you like create a robust http servers like a polar bear!, **Wizi** is small because his features are reduced only to the essentials, is focused on laws of simplicity, each part of his source code is useful, modular, simple, easy to understand and maintain. Other similar libraries have a lot of redundant [**LOC**](https://en.wikipedia.org/wiki/Source_lines_of_code). 

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
