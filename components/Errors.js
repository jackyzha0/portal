import React from 'react';
import {Box, Newline, Text} from "ink";

export default ({errors}) => errors.length !== 0 &&
  <Box marginTop={2} flexDirection="column">
    <Text color="red" bold>Errors:</Text>
    {errors.slice(0, 3).map((error, i) => <Text key={i}>
      {error}
    </Text>)}
    {errors.length > 3 && <Text color="red" bold>...and {errors.length - 3} more collapsed</Text>}
  </Box>