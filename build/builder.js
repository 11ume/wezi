import ts from 'rollup-plugin-typescript2'
import deps from './deps'

const createConfig = (config) => {
    const { plugins = [], external } = config
    return {
        input: 'index.ts'
        , output: [
            {
                file: 'dist/index.js'
                , format: 'esm'
                , sourcemap: true
            }
        ]
        , plugins: [
            ts()
            , ...plugins
        ]
        , external: [
            ...deps(external)
        ]
    }
}

export default createConfig
