import {useEffect, useState} from "react";
import {useConstant, useError} from "./utility";
import {ITreeRepresentation, Registry} from "../domain/registry";
import {Feed} from "hyperspace";

// Hook to register a local registry to listen to local file changes and push to remote
export default (dir: string, eventLog: Feed | undefined) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // array representation of registry internal trie
  const [registryRenderableArray, setRegistryRenderableArray] = useState<ITreeRepresentation[]>([])

  // create registry and add handlers
  const localRegistry: Registry = useConstant<Registry>(() => new Registry()
    .onError(addError)
    .onRerender(() => setRegistryRenderableArray(localRegistry.getTree()))
  )

  // subscribe to local to publish to eventLog if present
  useEffect(() => {
    if (eventLog) {
      localRegistry
        .addSubscriber(data => {
          eventLog
            .append(JSON.stringify(data))
            .catch(addError)
        })
        .watch(dir, () => setLoading(false))
    }
  }, [eventLog])

  return {
    errors,
    loading,
    localRegistry,
    registryRenderableArray
  }
}
