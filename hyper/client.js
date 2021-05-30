#!/usr/bin/env node
import { Client } from 'hyperspace'
import {Registry} from "./registry.js";

export async function startClient(key) {
  const { corestore, replicate } = new Client()
  const store = corestore()
  const eventBus = store.get({ key: key, valueEncoding: 'json' })

  // sync down
  await replicate(eventBus)

  // preload
  eventBus.download()

  // create internal registry
  const registry = new Registry()

  const process = (data) => {
    registry.parseEvt(JSON.parse(data))
  }

  // reconstruct file registry from event stream
  const dataPromises = []
  for (let i = 0; i < eventBus.length; i++) {
    dataPromises.push(eventBus.get(i))
  }
  const data = await Promise.all(dataPromises)
  data.forEach(process)

  console.log(registry.toString())

  // if we get a new block
  eventBus.on('append', async () => {
    const data = await eventBus.get(eventBus.length - 1)
    process(data)
    console.log('-------- update --------')
    console.log(registry.toString())
  })

  eventBus.on('close', () => {
    console.log('stream closed')
  })

  // TODO: handle more feed events here
  // https://github.com/hypercore-protocol/hypercore#feedondownload-index-data
}
