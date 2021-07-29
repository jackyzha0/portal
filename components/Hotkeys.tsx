import {Text} from 'ink'
import React from 'react'
import useHotkey from '../hooks/useHotkey'
import {useAppContext} from '../contexts/App'
import Loader from './Loader'

// Hotkey component to listen for hotkeys to exit
const Hotkeys = () => {
  useHotkey()
  const {closed} = useAppContext()
  return closed
    ? <Loader status="Cleaning up..." color="yellow"/>
    : <Text dimColor>[esc] or [q] to quit</Text>
}

export default Hotkeys
