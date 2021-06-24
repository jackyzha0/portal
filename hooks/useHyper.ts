import {useAsync} from 'react-async-hook'
import hyperSDK, {Hypercore, Hyperdrive} from 'hyper-sdk'
import {nanoid} from 'nanoid'
import {useState} from "react";

// Genesis block definition
export interface IGenesisBlock {
  status: 'genesis';
  key: string;
}

// Hook to initialize hyperspace related items (corestore, eventlog feed, hyperdrive)
const useHyper = (key?: string) => {
  const [peers, setPeers] = useState<string[]>([])

  const asyncHyper = useAsync(async () => {
    // Setup hyperspace client
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const hyper = await hyperSDK({
      persist: false,
      storage: null
    })
    const {
      Hypercore: newHypercore,
      Hyperdrive: newHyperdrive
    } = hyper

    let eventLog: Hypercore<string>
    let drive: Hyperdrive
    if (key) {
      // Recreate hypercore
      eventLog = newHypercore(key, {
        valueEncoding: 'json'
      })

      // Read genesis block and set drive info
      const genesisBlock = await eventLog.get(0)
      const driveKey = (JSON.parse(genesisBlock) as IGenesisBlock).key

      // Join drive
      drive = newHyperdrive(driveKey)
      await drive.ready()
    } else {
      // Open new portal
      const id = nanoid()

      // Create hypercore
      eventLog = newHypercore(`portal_eventLog_${id}`, {
        valueEncoding: 'json'
      })

      // Create drive
      drive = newHyperdrive(`portal_drive_${id}`)
      await drive.ready()

      // Fetch drive metadata and write to genesis block
      const genesis = JSON.stringify({
        status: 'genesis',
        key: drive.key.toString('hex')
      } as IGenesisBlock)
      await eventLog.append(genesis)
    }

    drive.on("peer-open", (peer) => {
      const peerKey = peer.remotePublicKey.toString('hex')
      setPeers(peers => peers.includes(peerKey) ?
        peers :
        [...peers, peerKey]
      )
    })

    drive.on("peer-remove", (peer) => {
      const peerKey = peer.remotePublicKey.toString('hex')
      setPeers(peers => peers.includes(peerKey) ?
        [...peers].filter(existingPeerKey => existingPeerKey !== peerKey) :
        peers
      )
    })

    return {
      eventLog,
      drive
    }
  }, [])

  return {
    numConnected: peers.length,
    hyperObj: asyncHyper.result,
    error: asyncHyper.error?.message,
    loading: asyncHyper.loading
  }
}

export default useHyper
