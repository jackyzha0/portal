import React from 'react'
import {Box, Newline, Text} from 'ink'
import {version, description} from '../package.json'
import useUpdateNotify from '../hooks/useUpdateNotify'

/// Displays help info
const Hello = () => {
  useUpdateNotify()
  return (
    <Box flexDirection="column">
      <Box
        marginY={1}
        flexDirection="column"
      >
        <Text>portal v{version}</Text>
        <Text dimColor>{description}</Text>
        <Newline/>
        <Text>To create a new portal in the current directory:
          <Text bold color="cyan"> portal new</Text>
        </Text>
        <Text>To join an existing portal:
          <Text bold color="cyan"> portal join [sessionId]</Text>
        </Text>
        <Newline/>
        <Text dimColor>
          <Text bold color="cyan">portal [command] --help </Text>
          for more information
        </Text>
      </Box>
    </Box>
  )
}

export default Hello
