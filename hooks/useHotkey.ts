import {useApp, useInput, useStdin} from 'ink'
import {useAppContext} from '../contexts/App'

const useHotkey = () => {
  const {exit} = useApp()
  const {isRawModeSupported} = useStdin()
  const {setClosed} = useAppContext()
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      setClosed()
      exit()
      process.exit()
    }
  }, {isActive: isRawModeSupported})
}

export default useHotkey
