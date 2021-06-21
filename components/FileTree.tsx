import React from 'react'
import {Box, Text} from 'ink'
import {ITreeRepresentation} from '../domain/registry'
import {STATUS} from '../domain/trie'
import Loader from './Loader'

interface IStatusIndicatorProps {
  status: STATUS;
}

// Node status indicator component
const StatusIndicator = ({status}: IStatusIndicatorProps) => {
  switch (status) {
    case STATUS.synced:
      return <Text color="green">█▍</Text>
    case STATUS.error:
      return <Text color="red">█▍</Text>
    case STATUS.unsynced:
    default:
      return <Text color="yellow">█▍</Text>
  }
}

const Legend = () => (
  <Box marginTop={1}>
    <Text bold>Legend: </Text>
    <Text color="green"> █▍Synced </Text>
    <Text color="yellow">█▍Unsynced </Text>
    <Text color="red">█▍Error </Text>
  </Box>
)

interface IFileTreeProps {
  registry: ITreeRepresentation[];
}

// File tree display component
const FileTree = ({registry}: IFileTreeProps) => {
  const synced = registry.filter(f => f.status === STATUS.synced).length
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>Files</Text>
      {registry.length > 0 ? registry.map((file, i) => (
        <Box key={`${file.name}_${i}`}>
          <StatusIndicator status={file.status}/>
          <Box paddingLeft={file.padding + 1}>
            <Text color={file.isDir ? 'cyan' : 'white'} bold={file.isDir}>
              {file.name}
            </Text>
          </Box>
        </Box>
      )) : <Text color="yellow">No files found</Text>}
      <Legend/>
      <Box marginTop={1}>
        <Text bold>
          Watching {registry.length} files ({synced}/{registry.length} synced)
        </Text>
      </Box>
    </Box>
  )
}

export default FileTree
