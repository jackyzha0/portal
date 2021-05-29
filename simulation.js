#!/usr/bin/env node
import { Client } from 'hyperspace'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv

const STATS_CORE_KEY = argv.key

start()

async function start () {
  const { corestore, replicate } = new Client()
  const store = corestore()
  const eventBus = store.get({ key: STATS_CORE_KEY, valueEncoding: 'json' })

  // sync down
  await replicate(eventBus)

  // preload
  eventBus.download()

  // print all blocks in eventBus
  for (let i = 0; i < eventBus.length; i++) {
    console.log(await eventBus.get(i))
  }
}
