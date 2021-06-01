import React from 'react'
import {Box, Text} from "ink";

export default ({registry}) => <Box flexDirection="column" marginTop={1}>
  <Text bold>Files</Text>
  {registry.length !== 0 ? registry.map(file => (
    <Box paddingLeft={file.padding} key={file.name}>
      <Text color={file.isDir ? 'cyan' : 'white'} bold={file.isDir}>
        {file.name}
      </Text>
    </Box>
  )) : <Text color="yellow">Waiting for remote files...</Text>}
  <Box marginTop={1}>
    <Text bold>Watching {registry.length} files</Text>
  </Box>
</Box>