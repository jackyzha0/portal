import path from 'path'
import {useEffect} from 'react'
import HyperDrive from 'hyperdrive'
import {Registry} from '../domain/registry'

// Hook to subscribe to a registry and sync all file changes to remote
const useDriveSync = (dir: string, registry: Registry, drive: HyperDrive | undefined) => {
  useEffect(() => {
    if (registry && drive) {
      registry.setDrive(drive)
      registry.sync()
      registry.addSubscriber(data => {
        if (data.status === 'add' || data.status === 'modify') {
          const segments = data.path.split(path.sep)
          const node = registry.find(segments)
          if (node) {
            // TODO: proper promise handling here
            node.sync().then(() => {}).catch(() => {})
          }
        }
      })
    }
  }, [registry, drive])
}

export default useDriveSync
