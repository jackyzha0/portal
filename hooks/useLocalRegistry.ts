import {useEffect, useState} from 'react'
import {Feed} from 'hyperspace'
import {ITreeRepresentation, Registry} from '../domain/registry'
import {useConstant, useError} from './utility'

// Hook to register a local registry to listen to local file changes and push to remote
const useLocalRegistry = (dir: string, eventLog: Feed | undefined, ignoreGitFiles: boolean, isDebug = false) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // Array representation of registry internal trie
  const [registryRenderableArray, setRegistryRenderableArray] = useState<ITreeRepresentation[]>([])

  // Create registry and add handlers
  const localRegistry: Registry = useConstant(() => new Registry(isDebug)
    .onError(addError)
    .onRerender(() => {
      setRegistryRenderableArray(localRegistry.getTree())
    })
  )

  // Subscribe to local to publish to eventLog if present
  useEffect(() => {
    if (eventLog) {
      localRegistry
        .addSubscriber('eventLogPublish', data => {
          eventLog
            .append(JSON.stringify(data))
            .catch(addError)
        })
        .watch(dir, () => {
          setLoading(false)
        }, ignoreGitFiles)
      return () => {
        localRegistry.removeSubscriber('eventLogPublish')
      }
    }
  }, [eventLog])

  return {
    errors,
    loading,
    localRegistry,
    registryRenderableArray
  }
}

export default useLocalRegistry
