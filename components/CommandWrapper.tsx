import React from 'react'
import {Box, Text} from 'ink'
import Loader from './Loader'
import Hotkeys from './Hotkeys'

interface ICommandWrapperProps {
  loading: boolean;
  error: string | undefined;
  children?: React.ReactNode;
}

// Wrapper component to show any loading/error states if they exist
// instead of children
const CommandWrapper = ({loading, error, children}: ICommandWrapperProps) => {
  if (loading) {
    return <Loader status="Initializing Hyperspace..."/>
  }

  if (error) {
    return (
      <>
        <Text>
          <Text color="red">Error connecting to hypercore: </Text>
          <Text>{error}</Text>
        </Text>
        <Hotkeys/>
      </>
    )
  }

  return <Box>{children}</Box>
}

export default CommandWrapper
