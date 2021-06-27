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
    case STATUS.syncing:
      return <Text color="yellow">█</Text>
    case STATUS.unsynced:
    default:
      return <Text>█</Text>
  }
}

const Legend = () => (
  <Box marginTop={1}>
    <Text bold>Legend:</Text>
    <Text color="green"> █ Synced </Text>
    <Text color="yellow">█ Syncing </Text>
    <Text color="red">█ Error </Text>
    <Text>█ Unsynced</Text>
  </Box>
)

const isFileQueued = (file: ITreeRepresentation) => {
  return file.status === STATUS.waitingForRemote || (file.stats.numTransfers === 1 && !file.stats.hasEnded)
}

const fmtPercentage = (number: number) => {
  return `${(number * 100).toFixed(2)}%`
}

interface IFileTreeProps {
  registry: ITreeRepresentation[];
  full: boolean;
}

const FullTreeFile = ({file}: {file: ITreeRepresentation}) => (
  <Box>
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
)

const TruncatedTreeFile = ({file}: {file: ITreeRepresentation}) => (
  <Box>
    <Box width="100%" paddingLeft={file.padding}>
      <Box width="80%">
        <Text
          color={file.isDir ? 'cyan' : 'white'}
          bold={file.isDir}
          dimColor={isFileQueued(file)}
          wrap="truncate"
        >
          {file.name}
        </Text>
      </Box>
      <Spacer/>
      <Text>{file.isDir ? '' : `${fmtPercentage(file.stats.totalTransferred / file.size)} of ${prettyBytes(file.size)}`}</Text>
    </Box>
  </Box>
)

// File tree display component
const DISPLAY_NUM = 50
const FileTree = ({registry, full}: IFileTreeProps) => {
  const emptyMessage = full ?
    <Text color="yellow">No files found</Text> :
    <Text bold color="green">All files synced</Text>
  const files = full ? registry : registry.filter(file => file.status !== STATUS.synced)
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>Files</Text>
      {files.length > 0 ? files.slice(0, 50).map((file, i) => (
        full ? <FullTreeFile key={i} file={file}/> : <TruncatedTreeFile key={i} file={file}/>
      )) : emptyMessage}
      {files.length > 50 && <Text bold color="cyan">...and {files.length - DISPLAY_NUM} more collapsed</Text>}
      {full && <Legend/>}
    </Box>
  )
}

export default FileTree
