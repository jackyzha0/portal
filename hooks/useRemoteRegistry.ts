import {useConstant, useError} from "./utility";
import {useEffect, useState} from "react";
import {ITreeRepresentation, Registry} from "../domain/registry";
import {Feed} from "hyperspace";

export default (dir: string, eventLog: Feed | undefined) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  const [registryRenderableArray, setRegistryRenderableArray] = useState<ITreeRepresentation[]>([])
  const remoteRegistry: Registry = useConstant<Registry>(() => new Registry()
    .onError(addError)
    .onRerender(() => setRegistryRenderableArray(remoteRegistry.getTree()))
  )

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