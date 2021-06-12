import {useEffect, useState} from "react";
import {useConstant, useError} from "./utility";
import {Registry} from "../fs/registry";

export default (dir, hyper) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // actual registry
  const [registryRenderableArray, setRegistryRenderableArray] = useState([])
  const localRegistry = useConstant(() => new Registry()
    .onError(addError)
    .onChange(() => setRegistryRenderableArray(localRegistry.getTree()))
    .watch(dir, () => setLoading(false))
  )

  const h = hyper?.hyperObj
  // also publish to eventLog if present
  useEffect(() => {
    if (h?.eventLog) {
      localRegistry.onChange(data => {
        h.eventLog
          .append(JSON.stringify(data))
          .catch(addError)
        setRegistryRenderableArray(localRegistry.getTree())
      })
    }
  }, [h?.eventLog])

  return {
    errors,
    loading,
    localRegistry,
    registryRenderableArray
  }
}
