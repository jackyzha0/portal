import React from 'react'
import {Box, Text} from 'ink'
import prettyBytes from 'pretty-bytes'
import {ITreeRepresentation} from '../domain/registry'
import {STATUS} from '../domain/trie'

export interface IStatsProps {
  totalBytes: number;
  bytesPerSecond: number;
  registry: ITreeRepresentation[];
}

const Stats = ({totalBytes, bytesPerSecond, registry}: IStatsProps) => {
  const synced = registry.filter(f => f.status === STATUS.synced).length
  return (
    <Box marginBottom={1} flexDirection="column">
      <Text>
        <Text bold color="blue">Discovered {registry.length} files </Text>
        <Text>({synced} synced)</Text>
      </Text>
      <Text>
        <Text bold>Throughput: </Text>
        <Text>{prettyBytes(bytesPerSecond)}/s, {prettyBytes(totalBytes)} transferred</Text>
      </Text>
    </Box>
  )
}

export default Stats
