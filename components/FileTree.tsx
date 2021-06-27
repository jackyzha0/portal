import React from 'react'
import {Box, Spacer, Text} from 'ink'
import prettyBytes from 'pretty-bytes'
import {ITreeRepresentation} from '../domain/registry'
import {STATUS} from '../domain/trie'

interface IStatusIndicatorProps {
  status: STATUS;
}

// Node status indicator component
const StatusIndicator = ({status}: IStatusIndicatorProps) => {
  switch (status) {
    case STATUS.synced:
      return <Text color="green">█</Text>
    case STATUS.error:
      return <Text color="red">█</Text>
    case STATUS.unsynced:
    default:
      return <Text color="yellow">█</Text>
  }
}

const Legend = () => (
  <Box marginTop={1}>
    <Text bold>Legend:</Text>
    <Text color="green"> █ Synced </Text>
    <Text color="yellow">█ Unsynced </Text>
    <Text color="red">█ Error </Text>
  </Box>
)

interface IFileTreeProps {
  registry: ITreeRepresentation[];
}

// File tree display component
const FileTree = ({registry}: IFileTreeProps) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold>Files</Text>
      {registry.length > 0 ? registry.map((file, i) => (
        <Box key={`${file.name}_${i}`}>
          <StatusIndicator status={file.status}/>
          <Box width="100%" paddingLeft={file.padding + 1}>
            <Box width="80%">
              <Text color={file.isDir ? 'cyan' : 'white'} bold={file.isDir} wrap="truncate">
                {file.name}
              </Text>
            </Box>
            <Spacer/>
            <Text>{file.isDir ? '' : prettyBytes(file.size)}</Text>
          </Box>
        </Box>
      )) : <Text color="yellow">No files found</Text>}
      <Legend/>
    </Box>
  )
}

export default FileTree
