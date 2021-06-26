import {useEffect, useState} from 'react'
import {Registry} from '../domain/registry'

const useStats = (registry: Registry) => {
  const [totalBytes, setTotalBytes] = useState(0)
  const [lastBps, setLastBps] = useState<number[]>([])
  const appendBps = (value: number) => {
    setLastBps(previous => [...previous, value].slice(-5))
  }

  useEffect(() => {
    let stale = true
    const handler = setTimeout(() => {
      const stats = registry.getStats()
      setTotalBytes(stats.totalBytes)
      appendBps(stats.bytesPerSecond)
      stale = true
    }, 100)

    registry.onRefreshStats(() => {
      if (stale) {
        stale = false
        handler.refresh()
      }
    })
    return () => {
      clearTimeout(handler)
      registry.onRefreshStats(() => {})
    }
  }, [])

  return {
    bytesPerSecond: lastBps.reduce((total, cur) => total + cur, 0) / 5,
    totalBytes
  }
}

export default useStats
