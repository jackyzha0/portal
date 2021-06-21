import path from 'path'
import {useEffect} from 'react'
import HyperDrive from 'hyperdrive'
import {Registry} from '../domain/registry'

// Hook to subscribe to a registry and download on all changes
const useDriveDownload = (dir: string, registry: Registry, drive: HyperDrive | undefined, pause = false) => {
  useEffect(() => {
    if (registry && drive && !pause) {
      registry.setDrive(drive)
      registry.download()
      registry.addSubscriber('driveDownload', data => {
        if (data.status === 'add' || data.status === 'modify') {
          const segments = data.path.split(path.sep)
          const node = registry.find(segments)
          if (node) {
            node.download().finally(() => {
              registry.rerender()
            })
          }
        }
        // TODO: handle delete
      })
      return () => {
        registry.removeSubscriber('driveDownload')
      }
    }
  }, [registry, drive, pause])
}

export default useDriveDownload
