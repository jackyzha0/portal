import React from 'react'
import {Box, Text} from "ink";
import Loader from "./Loader";
import {STATUS} from "../fs/registry";

const StatusIndicator = ({status}) => {
  switch (status) {
    case STATUS.synced:
      return <Text color="green">✔</Text>
    case STATUS.error:
      return <Text color="red">✖</Text>
    default:
    case STATUS.unsynced:
      return <Loader color="yellow"/>
  }
}

export default ({registry}) => <Box flexDirection="column" marginTop={1}>
  <Text bold>Files</Text>
  {registry.length !== 0 ? registry.map(file => (
    <Box key={file.name}>
      {file.status === STATUS.unsynced ?
        <Loader color="yellow"/> :
        <Text color="green">✔</Text>
      }
      <Box paddingLeft={file.padding + 2}>
        <Text color={file.isDir ? 'cyan' : 'white'} bold={file.isDir}>
          {file.name}
        </Text>
      </Box>
    </Box>
  )) : <Text color="yellow">Waiting for remote files...</Text>}
  <Box marginTop={1}>
    <Text bold>Watching {registry.length} files</Text>
  </Box>
</Box>