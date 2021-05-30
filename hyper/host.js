import { Client } from 'hyperspace'
import {registerWatcher} from "../fs/watcher.js";
import {Registry} from "./registry.js";

export async function startHost(dir) {
  const client = new Client()
  const store = client.corestore()

  const eventBus = store.get({ name: 'eventlog', valueEncoding: 'json' })
  await eventBus.ready()

  // in the future, maybe use https://www.npmjs.com/package/human-readable-ids
  console.log('Event Bus key is:', eventBus.key.toString('hex'))

  // publish
  await client.replicate(eventBus)

  // create internal registry
  const registry = new Registry()
  registerWatcher(dir, data => {
    registry.parseEvt(data)
    console.log('-------- update --------')
    console.log(registry.toString())
    eventBus
      .append(JSON.stringify(data))
      .catch(err => console.error(`Could not append stats: ${err.toString}`))
  })
}

