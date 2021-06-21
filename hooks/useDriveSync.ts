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
      registry.addSubscriber('driveSync', data => {
        const segments = data.path.split(path.sep)
        const node = registry.find(segments)
        if (node) {
          if (data.status === 'add' || data.status === 'modify') {
            node.sync().finally(() => {
              registry.rerender()
            })
          }
          if (data.status === 'delete') {
            const promise = data.isDir ?
              registry.drive?.promises.rmdir(data.path) :
              registry.drive?.promises.unlink(data.path)
            if (promise) {
              promise.finally(() => registry.rerender())
            }
          }
        }
      })
      return () => {
        registry.removeSubscriber('driveSync')
      }
    }
  }, [registry, drive])
}

export default useDriveSync
