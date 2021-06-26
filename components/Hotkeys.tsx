import {Text} from 'ink'
import React from 'react'
import useHotkey from '../hooks/useHotkey'
import Loader from './Loader'

interface IHotkeysProps {
  close: undefined | (() => Promise<void>);
}

// Hotkey component to listen for hotkeys to exit
const Hotkeys = ({close}: IHotkeysProps) => {
  const quitting = useHotkey(close)
  return quitting ?
    <Loader status="Cleaning up..." color="yellow"/> :
    <Text dimColor>[esc] or [q] to quit</Text>
}

export default Hotkeys
