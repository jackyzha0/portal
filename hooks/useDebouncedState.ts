import {useCallback, useEffect, useState} from 'react'
import {ITreeRepresentation, Registry} from '../domain/registry'

const TARGET_REFRESH_RATE = 24
const useDebouncedState = (registry: Registry) => {
  const [registryRenderableArray, setRegistryRenderableArray] = useState<ITreeRepresentation[]>([])

  const update = useCallback(() => {
    setRegistryRenderableArray(registry.getTree())
  }, [])

  useEffect(() => {
    update()
    const handler = setTimeout(() => {
      update()
    }, 1000 / TARGET_REFRESH_RATE)

    registry.onRerender(() => {
      handler.refresh()
    })

    return () => {
      clearTimeout(handler)
      registry.onRerender(() => {})
    }
  }, [])

  return registryRenderableArray
}

export default useDebouncedState
