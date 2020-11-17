import { listen } from 'wezi'
import w from 'service'

const main = async (port: number) => {
    await listen(w(), port)
    console.log(`service running on ${port}`)
}

main(3000)
