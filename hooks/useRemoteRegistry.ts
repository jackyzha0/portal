import {useEffect, useState} from 'react'
import {Feed} from 'hyperspace'
import {ITreeRepresentation, Registry} from '../domain/registry'
import {useConstant, useError} from './utility'
import useDebouncedState from "./useDebouncedState";

// Hook to register a remote registry to listen to remote file changes and sync down to local
const useRemoteRegistry = (dir: string, eventLog: Feed | undefined, isDebug = false) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // Create registry and add handlers
  const remoteRegistry: Registry = useConstant(() => new Registry(isDebug)
    .onError(addError)
  )
  const registryRenderableArray = useDebouncedState(remoteRegistry)

  // Subscribe to remote when remote is ready
  useEffect(() => {
    if (eventLog) {
      remoteRegistry.subscribeRemote(eventLog, () => {
        setLoading(false)
      })
    }
  }, [eventLog])

  return {
    errors,
    loading,
    remoteRegistry,
    registryRenderableArray
  }
}

export default useRemoteRegistry
