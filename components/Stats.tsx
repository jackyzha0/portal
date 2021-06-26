import React from 'react'
import {Box, Text} from 'ink'
import prettyBytes from 'pretty-bytes'

export interface IStatsProps {
  totalBytes: number;
  bytesPerSecond: number;
}

const Stats = ({totalBytes, bytesPerSecond}: IStatsProps) => <Box marginBottom={1} flexDirection="column">
  <Text bold>Throughput</Text>
  <Text>{prettyBytes(bytesPerSecond)}/s, {prettyBytes(totalBytes)} total
  </Text>
</Box>

export default Stats
