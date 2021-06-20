import React from 'react'
import {Text} from 'ink'

interface ISessionInfoProps {
  sessionId: string | undefined;
}

// Displays info about current portal session
export const SessionInfo = ({sessionId}: ISessionInfoProps) => (
  <>
    <Text bold>Session ID </Text>
    <Text>{sessionId}</Text>
  </>
)
