import {useEffect} from 'react'
import {Hyperdrive} from 'hyper-sdk'
import {Registry} from '../domain/registry'
import {isError} from '../fs/io'

// Hook to subscribe to a registry and sync all file changes to remote
const useDriveSync = (dir: string, registry: Registry, drive: Hyperdrive | undefined) => {
  useEffect(() => {
    if (registry && drive) {
      registry.setDrive(drive)
      registry.addSubscriber('driveSync', data => {
        const segments = data.path.split('/')
        if (data.status === 'add' || data.status === 'modify') {
          const node = registry.find(segments)
          if (node) {
            node
              .sync()
              .catch((error: Error) => {
                registry.errorCallback(`[sync] ${error.message}`)
              })
              .finally(() => {
                registry.rerender()
              })
          }
        }

        if (data.status === 'delete') {
          const promise = data.isDir ?
            drive.rmdir(data.path) :
            drive.unlink(data.path)
          promise.catch((error: unknown) => {
            // ignore if empty folder
            if (isError(error) && error.code !== 'ENOENT') {
              registry.errorCallback(`[sync] ${error.message}`)
            }
          }).finally(() => {
            registry.rerender()
          })
        }
      })
      return () => {
        registry.removeSubscriber('driveSync')
      }
    }
  }, [registry, drive])
}

export default useDriveSync
