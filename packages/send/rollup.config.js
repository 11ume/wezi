import config from '../../build/builder'
import { dependencies } from './package.json'

export default config({
    external: dependencies
})
