import React from 'react'
import {Box, Spacer, Text} from 'ink'
import prettyBytes from 'pretty-bytes'
import useStdoutDimensions from 'ink-use-stdout-dimensions'
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

// Helper Functions
// is current filed queued for upload/download
const isFileQueued = (file: ITreeRepresentation) => file.stats.numTransfers === 0 && !file.stats.hasEnded

// Format number [0,1] to percent scale with 1 decimal point
const fmtPercentage = (number: number) => `${(number * 100).toFixed(1)}%`

interface IFileTreeProps {
  registry: ITreeRepresentation[];
  full: boolean;
}
// Full Tree display
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

// Truncated Tree display (default)
const TruncatedTreeFile = ({file}: {file: ITreeRepresentation}) => (
  <Box width="100%">
    <Box width="80%">
      <Text
        color={file.isDir ? 'cyan' : 'white'}
        dimColor={isFileQueued(file)}
        wrap="truncate"
      >
        {file.path}
      </Text>
    </Box>
    <Spacer/>
    <Text>{file.isDir ? '' : `${fmtPercentage(file.stats.totalTransferred / file.size)} of ${prettyBytes(file.size)}`}</Text>
  </Box>
)

// File tree display component
const FileTree = ({registry, full}: IFileTreeProps) => {
  // Number of lines to display (truncate if screen is small)
  const DISPLAY_NUM = Math.max(useStdoutDimensions()[1] - 15, 1)

  const emptyMessage = full
    ? <Text color="yellow">No files found</Text>
    : <Text bold color="green">All files synced</Text>

  // Only show non-folders and unsynced/syncing files by default
  const files = full ? registry : registry.filter(file => (file.status !== STATUS.synced) && !file.isDir).sort((a, b) => b.size - a.size)
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="blue">Files</Text>
      {files.length > 0 ? files.slice(0, DISPLAY_NUM).map((file, i) => (
        full ? <FullTreeFile key={i} file={file}/> : <TruncatedTreeFile key={i} file={file}/>
      )) : emptyMessage}
      {files.length > DISPLAY_NUM && <Text bold color="cyan">...and {files.length - DISPLAY_NUM} more collapsed</Text>}
      {full && <Legend/>}
    </Box>
  )
}

export default FileTree
