export default {
    cache: false
    , timeout: '1m'
    , concurrency: 6
    , babel: {
        compileEnhancements: false
    }
    , files: [
        '!dev'
        , '!dist'
    ]
    , require: ['ts-node/register']
    , extensions: ['ts']
}
