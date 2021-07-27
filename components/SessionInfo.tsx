import React from 'react'
import {Text} from 'ink'

interface ISessionInfoProps {
  sessionId: string | undefined;
  numConnected: number;
}

// Displays info about current portal session
export const SessionInfo = ({sessionId, numConnected}: ISessionInfoProps) => (
  <>
    <Text bold color="blue">Session ID ({numConnected} {numConnected === 1 ? 'peer' : 'peers'} connected)</Text>
    <Text color="yellow">{sessionId}</Text>
  </>
)
