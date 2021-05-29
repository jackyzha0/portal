#!/usr/bin/env node
import { Client } from 'hyperspace'

export async function startClient(key) {
  const { corestore, replicate } = new Client()
  const store = corestore()
  const eventBus = store.get({ key: key, valueEncoding: 'json' })

  // sync down
  await replicate(eventBus)

  // preload
  eventBus.download()

  // print all blocks in eventBus
  for (let i = 0; i < eventBus.length; i++) {
    console.log(await eventBus.get(i))
  }

  // if we get a new block
  eventBus.on('append', async () => {
    console.log(await eventBus.get(eventBus.length - 1))
  })

  eventBus.on('close', () => {
    console.log('stream closed')
  })

  // TODO: handle more feed events here
  // https://github.com/hypercore-protocol/hypercore#feedondownload-index-data
}
