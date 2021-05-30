import { Client } from 'hyperspace'
import {registerWatcher} from "../fs/watcher.js";

export async function startHost(dir) {
  const client = new Client()
  const store = client.corestore()

  const eventBus = store.get({ name: 'eventlog', valueEncoding: 'json' })
  await eventBus.ready()

  // in the future, maybe use https://www.npmjs.com/package/human-readable-ids
  console.log('Event Bus key is:', eventBus.key.toString('hex'))

  // publish
  await client.replicate(eventBus)

  registerWatcher(dir, data => {
    eventBus
      .append(JSON.stringify(data))
      .catch(err => console.error(`Could not append stats: ${err.toString}`))
  })
}

