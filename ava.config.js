export default {
    cache: false
    , timeout: '1m'
    , concurrency: 4
    , babel: {
        compileEnhancements: false
    }
    , files: [
        '!dev'
    ]
    , require: ['ts-node/register']
    , extensions: ['ts']
}
