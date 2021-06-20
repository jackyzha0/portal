import {useConstant, useError} from "./utility";
import {useEffect, useState} from "react";
import {ITreeRepresentation, Registry} from "../domain/registry";
import {Feed} from "hyperspace";

// Hook to register a remote registry to listen to remote file changes and sync down to local
export default (dir: string, eventLog: Feed | undefined) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // array representation of registry internal trie
  const [registryRenderableArray, setRegistryRenderableArray] = useState<ITreeRepresentation[]>([])

  // create registry and add handlers
  const remoteRegistry: Registry = useConstant<Registry>(() => new Registry()
    .onError(addError)
    .onRerender(() => setRegistryRenderableArray(remoteRegistry.getTree()))
  )

  // subscribe to remote when remote is ready
  useEffect(() => {
    if (eventLog) {
      remoteRegistry.subscribeRemote(eventLog, () => setLoading(false))
    }
  }, [eventLog])

  return {
    errors,
    loading,
    remoteRegistry,
    registryRenderableArray
  }
}