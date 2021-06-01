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

export default ({sessionId}) => <Box flexDirection="column">
  <TitleCard />
  <Box margin={1}>
    <Text bold>Session ID: </Text>
    <Text>{sessionId}</Text>
  </Box>
</Box>