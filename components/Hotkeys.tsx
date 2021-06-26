import {Text} from 'ink'
import React from 'react'
import useHotkey from '../hooks/useHotkey'

interface IHotkeysProps {
  close: undefined | (() => Promise<void>);
}

// Hotkey component to listen for hotkeys to exit
const Hotkeys = ({close}: IHotkeysProps) => {
  useHotkey(close)
  return (<Text dimColor>[esc] or [q] to quit</Text>)
}

export default Hotkeys
