import {Registry} from "../fs/registry.js"
import {Server, Client} from 'hyperspace'
import Hyperdrive from 'hyperdrive'
import { useAsync } from 'react-async-hook'
import { nanoid } from 'nanoid'

export default (key, onReady) => {
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

    // initialize eventLog
    const eventLog = key ?
      store.get({ key: key, valueEncoding: 'json' }) :
      store.get({ name: nanoid(), valueEncoding: 'json' })
    await eventLog.ready()

    // initialize hyperdrive
    const drive = new Hyperdrive(store, key ? Buffer.from(key, 'hex') : null)
    await drive.promises.ready()
    await client.replicate(drive.metadata)

    const remoteRegistry = new Registry(drive)

    // replicate
    await client.replicate(eventLog)
    const hyper = { store, remoteRegistry, eventLog, drive }
    onReady(hyper)
    return hyper
  }, [])

  return {
    hyper: asyncHyper.result,
    error: asyncHyper.error?.message,
    loading: asyncHyper.loading,
  }
}