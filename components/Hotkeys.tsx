import {Text} from 'ink'
import React from 'react'
import useHotkey from '../hooks/useHotkey'

// Hotkey component to listen for hotkeys to exit
const Hotkeys = () => {
  useHotkey()
  return (<Text dimColor>[esc] or [q] to quit.</Text>)
}

export default Hotkeys
