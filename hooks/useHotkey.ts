import {promisify} from 'util'
import {useApp, useInput} from 'ink'
import {useAppContext} from '../contexts/App'

const useHotkey = (close: undefined | (() => void)) => {
  const {exit} = useApp()
  const {setClosed} = useAppContext()
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      setClosed()
      exit()
      if (close) {
        promisify(close)().finally(() => process.exit())
      } else {
        process.exit()
      }
    }
  })
}

export default useHotkey
