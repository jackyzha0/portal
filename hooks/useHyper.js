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
    const drive = new Hyperdrive(store, null)
    // let drive
    // if (!key) {
    //   // new drive
    //   drive = new Hyperdrive(store, null)
    //   await drive.promises.ready()
    //
    //   // fetch drive metadata and write to genesis block
    //
    //
    //   await client.replicate(drive.metadata)
    // } else {
    //   // if key exists, read genesis block and set drive info
    // }
    // const hypercoreKey = key ?
    //   Buffer.from(key, 'hex') :
    //   eventLog.key
    // const
    //
    //
    // // create remote registry
    // const remoteRegistry = new Registry()
    // remoteRegistry.drive = drive

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