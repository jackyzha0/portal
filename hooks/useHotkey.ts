import {promisify} from 'util'
import {useApp, useInput} from 'ink'

const useHotkey = (close: undefined | (() => void)) => {
  const {exit} = useApp()
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
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
