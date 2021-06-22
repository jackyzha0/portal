import {useApp, useInput} from "ink";

const useHotkey = () => {
  const {exit} = useApp()
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit()
      process.exit()
    }
  })
}

export default useHotkey