import React from "react";
import {Box, Newline, Text} from "ink";

export default ({text, sessionId}) => <Box flexDirection="column">
  <Box
    paddingX={3}
    borderStyle="bold"
    justifyContent="space-between"
  >
    <Text color="green" bold>{text}</Text>
    <Text
      color="white"
      dimColor
    >two-way p2p folder syncing</Text>
  </Box>
  <Box margin={1}>
    <Text bold>Session ID: </Text>
    <Text>{sessionId}</Text>
  </Box>
</Box>