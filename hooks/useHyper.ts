import {Server, Client} from 'hyperspace'
import Hyperdrive from 'hyperdrive'
import {useAsync} from 'react-async-hook'
import {nanoid} from 'nanoid'

// Genesis block definition
export interface IGenesisBlock {
  status: 'genesis';
  key: string;
}

// Hook to initialize hyperspace related items (corestore, eventlog feed, hyperdrive)
const useHyper = (key?: string) => {
  const asyncHyper = useAsync(async () => {
    // Setup hyperspace client
    let client: Client
    let server: Server
    try {
      // Use existing daemon if exists
      client = new Client()
      await client.ready()
    } catch {
      // No daemon, start it in-process
      server = new Server()
      await server.ready()
      client = new Client()
      await client.ready()
    }

    const store = client.corestore()
    await store.ready()

    // Initialize eventLog feed from corestore
    const eventLog = key ?
      store.get({key, valueEncoding: 'json'}) :
      store.get({name: nanoid(), valueEncoding: 'json'})
    await eventLog.ready()
    await client.replicate(eventLog)

    // Initialize hyperdrive
    let drive: Hyperdrive
    if (key) {
      // Read genesis block and set drive info
      const genesisBlock = await eventLog.get(0)
      const driveKey = (JSON.parse(genesisBlock) as IGenesisBlock).key
      drive = new Hyperdrive(store, Buffer.from(driveKey, 'hex'))
      await drive.promises.ready()
    } else {
      // If no key, new drive
      drive = new Hyperdrive(store, null)
      await drive.promises.ready()

      // Fetch drive metadata and write to genesis block
      await eventLog.append(JSON.stringify({
        status: 'genesis',
        key: drive.metadata.key.toString('hex')
      } as IGenesisBlock))
    }
    await client.replicate(drive.metadata)

    return {
      store,
      eventLog,
      drive
    }
  }, [])

  return {
    hyperObj: asyncHyper.result,
    error: asyncHyper.error?.message,
    loading: asyncHyper.loading
  }
}

export default useHyper
