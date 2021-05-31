import {Registry} from "../fs/registry.js"
import {Server, Client} from 'hyperspace'
import { useAsync } from 'react-async-hook'
import { nanoid } from 'nanoid'

export default (key, onFinishCallback = () => {}) => {
  const asyncHyper = useAsync(async () => {
    // setup hyperspace client
    let client
    let server
    try {
      // use existing daemon if exists
      client = new Client()
      await client.ready()
    } catch (e) {
      // no daemon, start it in-process
      server = new Server()
      await server.ready()

      client = new Client()
      await client.ready()
    }

    const store = client.corestore()
    const eventBus = key ?
      store.get({ key: key, valueEncoding: 'json' }) :
      store.get({ name: nanoid(), valueEncoding: 'json' })
    const registry = new Registry()
    await eventBus.ready()

    // replicate
    await client.replicate(eventBus)

    onFinishCallback({ registry, eventBus })
    return { store, registry, eventBus }
  }, [])

  return {
    hyper: asyncHyper.result,
    error: asyncHyper.error?.message,
    loading: asyncHyper.loading,
  }
}