import React from 'react'
import {Text} from 'ink'
import prettyBytes from 'pretty-bytes'

export interface IStatsProps {
  totalBytes: number;
  bytesPerSecond: number;
}

const Stats = ({totalBytes, bytesPerSecond}: IStatsProps) => {
  return (
    <Text>{prettyBytes(bytesPerSecond)}/s, {prettyBytes(totalBytes)} total
    </Text>
  )
}

export default Stats
