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

const writePackages = (path) => (fn) => {
    const pkg = require(path)
    fs.writeFile(path, fn(pkg), (err) => {
        if (err) throw err
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
