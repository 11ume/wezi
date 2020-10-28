export default {
    cache: false,
    timeout: '1m',
    concurrency: 6,
    babel: {
        compileEnhancements: false
    },
    require: ['ts-node/register'],
    extensions: ['ts']
}