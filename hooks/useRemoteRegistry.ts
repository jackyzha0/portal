import {useEffect, useState} from 'react'
import {Hypercore} from 'hyper-sdk'
import {Registry} from '../domain/registry'
import {useConstant, useError} from './utility'
import useDebouncedState from './useDebouncedState'
import useStats from './useStats'

// Hook to register a remote registry to listen to remote file changes and sync down to local
const useRemoteRegistry = (dir: string, eventLog: Hypercore<string> | undefined, isDebug: boolean, isPaused: boolean) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // Create registry and add handlers
  const remoteRegistry: Registry = useConstant(() => new Registry(isDebug)
    .onError(addError)
  )
  const registryRenderableArray = useDebouncedState(remoteRegistry)
  const stats = useStats(remoteRegistry)

  // Subscribe to remote when remote is ready
  useEffect(() => {
    if (eventLog && !isPaused) {
      remoteRegistry.subscribeRemote(eventLog, () => {
        setLoading(false)
      })
    }
  }, [eventLog, isPaused])

  return {
    errors,
    loading,
    remoteRegistry,
    registryRenderableArray,
    stats
  }
}

export default useRemoteRegistry
