
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
    to create robust web applications and microservices like polar bears!. 
<p>

<br>

<div align="center"> 
    
[![ci status](https://img.shields.io/github/workflow/status/11ume/wezi/ci?style=flat&colorA=000000&colorB=000000)](https://github.com/11ume/wezi/actions?query=workflow%3Aci)
[![js-standard-style](https://img.shields.io/badge/code%20style%20-standard-standard?style=flat&colorA=000000&colorB=000000)](http://standardjs.com)
[![codecov](https://img.shields.io/badge/☂%20-coverage-☂?style=flat&colorA=000000&colorB=000000)](https://codecov.io/gh/11ume/wezi/branch/main)
[![discord shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=92E8FF)](https://discord.com)

</div>
    
<br>

> ⚠️ Wezi is currently under development, the documentation is coming!.

<br>

> Features

<br>

* **Small** To be easy and fast to learn.
* **Simple** Focused on simplicity, hides the complexity and respect the [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) principle.
* **Fast** High performance (even JSON parsing is opt-in, fast router).  
* **Async** Implements an enhanced async control of handlers execution.
* **Safe** Designed to avoid failures.
* **Middlwares** Implements a middleware logic.

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

## Get started

<br>

```ts
import wezi, { listen } from 'wezi'

const greet = () => 'Hi!'
listen(wezi(greet), 3000)
```

