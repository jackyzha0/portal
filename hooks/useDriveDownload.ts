import path from 'path'
import {useEffect} from 'react'
import HyperDrive from 'hyperdrive'
import {Registry} from '../domain/registry'

// Hook to subscribe to a registry and download on all changes
const useDriveDownload = (dir: string, registry: Registry, drive: HyperDrive | undefined) => {
  useEffect(() => {
    if (registry && drive) {
      registry.setDrive(drive)
      registry.download()
      registry.addSubscriber(data => {
        if (data.status === 'add' || data.status === 'modify') {
          const segments = data.path.split(path.sep)
          const node = registry.find(segments)
          if (node) {
            // TODO: proper promise handling here
            node.download().then(() => {}).catch(() => {})
          }
        }
      })
    }
  }, [registry, drive])
}

export default useDriveDownload
