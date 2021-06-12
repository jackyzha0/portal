import React from "react";
import {Box, Text} from "ink";

export const TitleCard = () => <Box
  paddingX={3}
  borderStyle="bold"
  justifyContent="space-between"
>
  <Text color="green" bold>portal</Text>
  <Text
    color="white"
    dimColor
  >p2p directory syncing</Text>
</Box>

export const SessionInfo = ({sessionId}) => <>
  <Text bold>Session ID </Text>
  <Text>{sessionId}</Text>
</>