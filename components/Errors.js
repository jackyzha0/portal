import React from 'react';
import {Box, Newline, Text} from "ink";

export default ({errors}) => errors.length !== 0 &&
  <Box marginTop={2} flexDirection="column">
    <Text color="red" bold>Errors:</Text>
    {errors.map((error, i) => <Text key={i}>
      {error}
    </Text>)}
  </Box>