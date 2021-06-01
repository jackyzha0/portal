import React from "react";
import {Box, Newline, Text} from "ink";

export const TitleCard = () => <Box
  paddingX={3}
  borderStyle="bold"
  justifyContent="space-between"
>
  <Text color="green" bold>portal</Text>
  <Text
    color="white"
    dimColor
  >two-way P2P folder syncing</Text>
</Box>

export const SessionInfo = ({sessionId}) => <Box>
  <Text bold>Session ID: </Text>
  <Text>{sessionId}</Text>
</Box>