import React from 'react'
import {Box, Text} from "ink";
import {ITreeRepresentation, STATUS} from "../domain/registry";
import Loader from "./Loader";

interface IStatusIndicatorProps {
  status: STATUS;
}

// Node status indicator component
const StatusIndicator = ({status}: IStatusIndicatorProps) => {
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

interface IFileTreeProps {
  registry: ITreeRepresentation[],
}

// File tree display component
export default ({registry}: IFileTreeProps) => {
  const synced = registry.filter(f => f.status === STATUS.synced).length
  return <Box flexDirection="column" marginY={1}>
    <Text bold>Files</Text>
    {registry.length !== 0 ? registry.map(file => (
      <Box key={file.name}>
        <StatusIndicator status={file.status} />
        <Box paddingLeft={file.padding + 2}>
          <Text color={file.isDir ? 'cyan' : 'white'} bold={file.isDir}>
            {file.name}
          </Text>
        </Box>
      </Box>
    )) : <Text color="yellow">No files found</Text>}
    <Box marginTop={1}>
      <Text bold>
        Watching {registry.length} files ({synced}/{registry.length} synced)
      </Text>
    </Box>
  </Box>
}