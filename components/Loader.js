import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

export default ({status, color}) => (
  <Text>
    <Text color={color ?? "green"}>
      <Spinner type="dots" />
    </Text>
    {status ? ` ${status}` : ''}
  </Text>
);