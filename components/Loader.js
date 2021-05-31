import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

export default ({status}) => (
  <Text>
    <Text color="green">
      <Spinner type="dots" />
    </Text>
    {` ${status}`}
  </Text>
);