import {useEffect, useState} from "react";
import {useConstant, useError} from "./utility";
import {Registry} from "../domain/registry";

export default (dir, eventLog) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // actual registry
  const [registryRenderableArray, setRegistryRenderableArray] = useState([])
  const localRegistry = useConstant(() => new Registry()
    .onError(addError)
    .addSubscriber(() => setRegistryRenderableArray(localRegistry.getTree()))
    .watch(dir, () => setLoading(false))
  )

  // also publish to eventLog if present
  useEffect(() => {
    if (eventLog) {
      localRegistry.addSubscriber(data => {
        eventLog
          .append(JSON.stringify(data))
          .catch(addError)
      })
    }
  }, [eventLog])

  return {
    errors,
    loading,
    localRegistry,
    registryRenderableArray
  }
}
