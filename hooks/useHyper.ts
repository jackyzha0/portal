import {Server, Client} from 'hyperspace'
import Hyperdrive from 'hyperdrive'
import { useAsync } from 'react-async-hook'
import { nanoid } from 'nanoid'

// Genesis block definition
export interface IGenesisBlock {
  status: 'genesis',
  key: string,
}

// Hook to initialize hyperspace related items (corestore, eventlog feed, hyperdrive)
export default (key?: string) => {
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
    await store.ready()

    // initialize eventLog feed from corestore
    const eventLog = key ?
      store.get({ key: key, valueEncoding: 'json' }) :
      store.get({ name: nanoid(), valueEncoding: 'json' })
    await eventLog.ready()

    // initialize hyperdrive
    let drive
    if (!key) {
      // if no key, new drive
      drive = new Hyperdrive(store, null)
      await drive.promises.ready()

      // fetch drive metadata and write to genesis block
      await eventLog.append(JSON.stringify({
        status: 'genesis',
        key: drive.metadata.key.toString('hex'),
      } as IGenesisBlock))
    } else {
      // if key exists, predownload eventLog
      eventLog.download()

      // read genesis block and set drive info
      const genesisBlock = await eventLog.get(0)
      const driveKey = (JSON.parse(genesisBlock) as IGenesisBlock).key
      drive = new Hyperdrive(store, Buffer.from(driveKey, 'hex'))
      await drive.promises.ready()
    }

    // seed remote
    await client.replicate(drive.metadata)
    await client.replicate(eventLog)
    return {
      store,
      eventLog,
      drive
    }
  }, [])

  return {
    hyperObj: asyncHyper.result,
    error: asyncHyper.error?.message,
    loading: asyncHyper.loading,
  }
}