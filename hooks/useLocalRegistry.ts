import {useEffect, useState} from "react";
import {useConstant, useError} from "./utility";
import {Registry} from "../domain/registry";

export default (dir, eventLog) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  const [registryRenderableArray, setRegistryRenderableArray] = useState([])
  const localRegistry = useConstant(() => new Registry()
    .onError(addError)
    .onRerender(() => setRegistryRenderableArray(localRegistry.getTree()))
  )

  // also publish to eventLog if present
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
