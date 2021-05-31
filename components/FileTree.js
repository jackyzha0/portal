import React from 'react'
import {Box, Text} from "ink";

export default ({registry}) => {
  return <Box flexDirection="column" marginX={1}>
    <Text bold>Files (tracking {registry.length})</Text>
    {registry.length !== 0 ? registry.map(file => (
      <Box paddingLeft={file.padding} key={file.name}>
        <Text color={file.isDir ? 'cyan' : 'white'} bold={file.isDir}>
          {file.name}
        </Text>
      </Box>
    )) : <Text color="yellow">Waiting for remote files...</Text>}
  </Box>
}