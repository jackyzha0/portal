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
      const process = (data) => {
        remoteRegistry.parseEvt(JSON.parse(data))
        setRegistryRenderableArray(registryRenderableArray.getTree())
      }

      // sync down and preload
      eventLog.download()

      // reconstruct file registry from event stream
      const dataPromises = []
      for (let i = 0; i < eventLog.length; i++) {
        dataPromises.push(eventLog.get(i))
      }
      Promise.all(dataPromises)
        .then(data => data.forEach(process))
        .then(() => setLoading(false))

      eventLog
        .on('append', async () => {
          const data = await eventLog.get(eventLog.length - 1)
          process(data)
        })
        .on('close', () => {
          console.log('stream closed')
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