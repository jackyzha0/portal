import {promisify} from 'util'
import {useApp, useInput} from 'ink'
import {useState} from 'react'

const useHotkey = (close: undefined | (() => void)) => {
  const {exit} = useApp()
  const [quitting, setQuitting] = useState(false)
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      setQuitting(true)
      exit()
      if (close) {
        promisify(close)().finally(() => process.exit())
      } else {
        process.exit()
      }
    }
  })

  return quitting
}

export default useHotkey
