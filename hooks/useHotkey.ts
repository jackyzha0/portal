import {useApp, useInput} from 'ink'
import {useAppContext} from '../contexts/App'

const useHotkey = () => {
  const {exit} = useApp()
  const {setClosed} = useAppContext()
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      setClosed()
      exit()
      process.exit()
    }
  })
}

export default useHotkey
