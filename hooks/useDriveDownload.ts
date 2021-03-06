import {useEffect} from 'react'
import {Hyperdrive} from 'hyper-sdk'
import {Registry} from '../domain/registry'
import {rm} from '../fs/io'

// Hook to subscribe to a registry and download on all changes
const useDriveDownload = (dir: string, registry: Registry, drive: Hyperdrive | undefined) => {
  useEffect(() => {
    if (registry && drive) {
      registry.setDrive(drive)
      registry.addSubscriber('driveDownload', data => {
        const segments = data.path.split('/')
        if (data.status === 'add' || data.status === 'modify') {
          const node = registry.find(segments)
          if (node) {
            node
              .download()
              .catch((error: Error) => {
                registry.errorCallback(`[download] ${error.message}`)
              })
              .finally(() => {
                registry.rerender()
              })
          }
        }

        if (data.status === 'delete') {
          rm(segments, data.isDir)
            .catch((error: Error) => {
              registry.errorCallback(`[download] ${error.message}`)
            })
            .finally(() => {
              registry.rerender()
            })
        }
      })
      return () => {
        registry.removeSubscriber('driveDownload')
      }
    }
  }, [registry, drive])
}

export default useDriveDownload
