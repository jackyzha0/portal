import {startHost} from "./hyper/host.js"
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import {startClient} from "./hyper/client.js"
const argv = yargs(hideBin(process.argv)).argv

const STATS_CORE_KEY = argv.key

if (STATS_CORE_KEY) {
  // start client
  await startClient(STATS_CORE_KEY)
} else {
  // start server
  await startHost(argv.dir ?? ".")
}
