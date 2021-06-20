import React from "react";
import {Text} from "ink";

interface ITitleProps {
  sessionId: string,
}
export const SessionInfo = ({sessionId}: ITitleProps) => <>
  <Text bold>Session ID </Text>
  <Text>{sessionId}</Text>
</>