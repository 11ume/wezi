export default {
    cache: false,
    timeout: '600s',
    concurrency: 6,
    babel: {
        compileEnhancements: false
    },
    files: [
        '!dev'
    ],
    require: ['ts-node/register'],
    extensions: ['ts']
}