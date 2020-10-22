export default {
    cache: true,
    timeout: '2m',
    concurrency: 6,
    babel: {
        compileEnhancements: false
    },
    files: [
        '!dist'
        , '!dev'
    ],
    require: ['ts-node/register'],
    extensions: ['ts']
}