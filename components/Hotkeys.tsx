import {Text, useApp, useInput} from 'ink'
import React from 'react'

// Hotkey component to listen for hotkeys to exit
const Hotkeys = () => {
  const {exit} = useApp()
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit()
      process.exit()
    }
  })

  return (<Text dimColor>[esc] or [q] to quit.</Text>)
}

export default Hotkeys
