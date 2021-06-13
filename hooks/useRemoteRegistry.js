import {useConstant, useError} from "./utility";
import {useEffect, useState} from "react";
import {Registry} from "../domain/registry";

export default (dir, eventLog) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  const [registryRenderableArray, setRegistryRenderableArray] = useState([])
  const remoteRegistry = useConstant(() => new Registry()
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