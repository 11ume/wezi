/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

const [,, cmd] = process.argv

const add = (pkg) => {
    const obj = Object.assign(pkg, {
        type: 'module'
    })

    return JSON.stringify(obj, null, 4)
}

const remove = (pkg) => {
    const obj = Object.assign({}, pkg)
    delete obj.type
    return JSON.stringify(obj, null, 4)
}

const writePackages = (fn) => (packagePath) => {
    const package = require(packagePath)
    fs.writeFile(packagePath, fn(package), (err) => {
        if (err) throw err
        console.log(`success ${fn.name} prop type from`, packagePath)
    })
}

const getPackages = (target) => {
    const packagesDir = path.join(__dirname, target)
    return fs
        .readdirSync(packagesDir)
        .map((dir) => path.join(packagesDir, dir, 'package.json'))
}

const write = (fn) => {
    const packagesPath = getPackages('../packages')
    packagesPath.forEach(writePackages(fn))
}

if (cmd === '--add') {
    write(add)
}

if (cmd === '--remove') {
    write(remove)
}
