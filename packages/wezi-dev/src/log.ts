import { IncomingMessage } from 'http'
import chalk from 'chalk'
import jsome from 'jsome'
import stringLength from 'string-length'
import { json } from 'wezi-receive'
import { Context } from 'wezi-types'

export const logLine = (message: string, date: Date) => {
    const dateString = `${chalk.grey(date.toLocaleTimeString())}`
    let logSpace =
    process.stdout.columns - stringLength(message) - stringLength(dateString)

    if (logSpace <= 0) {
        logSpace = 10
    }

    console.log(`${message}${' '.repeat(logSpace)} ${dateString}`)
}

const isJson = (req: IncomingMessage) => req.headers['content-type'].indexOf('application/json') === 0
const payloadIsNotEmpty = (req: IncomingMessage) => req.headers['content-length'] > '0'

export const logReply = async (context: Context, start: Date, requestIndex: number) => {
    logLine(`#${requestIndex} reply ${chalk.bold(context.req.method)} ${context.req.url}`, start)

    if (payloadIsNotEmpty(context.req) && isJson(context.req)) {
        try {
            const parsedJson = await json(context)
            jsome(parsedJson)
            console.log('')
        } catch (err) {
            console.log(`JSON body could not be parsed: ${err.message} \n`)
        }
    }
}

export const logNext = async (context: Context, start: Date, requestIndex: number) => {
    logLine(`#${requestIndex} next ${chalk.bold(context.req.method)} ${context.req.url}`, start)
}

export const logStatusCode = (statusCode: number) => {
    if (statusCode >= 500) {
        return chalk.red(statusCode)
    }

    if (statusCode >= 400 && statusCode < 500) {
        return chalk.yellow(statusCode)
    }

    if (statusCode >= 300 && statusCode < 400) {
        return chalk.blue(statusCode)
    }

    if (statusCode >= 200 && statusCode < 300) {
        return chalk.green(statusCode)
    }

    return statusCode
}
