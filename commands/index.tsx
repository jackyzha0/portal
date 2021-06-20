import React from 'react';
import {version, description} from '../package.json';
import {Box, Newline, Text} from "ink";

/// Displays help info
const Hello = () => <Box flexDirection="column">
  <Box
    margin={1}
    flexDirection="column"
  >
    <Text>Version: {version}</Text>
    <Text dimColor>{description}</Text>
    <Newline/>
    <Text>To create a new portal in the current directory:
      <Text color="cyan" bold> portal new</Text>
    </Text>
    <Text>To join an existing portal:
      <Text color="cyan" bold> portal join [sessionId]</Text>
    </Text>
    <Newline/>
    <Text dimColor>
      <Text color="cyan" bold>portal [command] --help </Text>
      for more information
    </Text>
  </Box>
</Box>;
export default Hello;