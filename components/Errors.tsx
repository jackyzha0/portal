import React from 'react'
import {Box, Text} from 'ink'

interface IErrorsProps {
  errors: string[];
}

// Error display component. Does not render if no errors are logged
const Errors = ({errors}: IErrorsProps) => {
  if (errors.length === 0) {
    return null
  }

  // Only renders first 3 errors, truncates rest
  return (
    <Box marginTop={2} flexDirection="column">
      <Text bold color="red">Errors:</Text>
      {errors.slice(0, 3).map((error, i) => (
        <Text key={i}>
          {error}
        </Text>
      ))}
      {errors.length > 3 && <Text bold color="red">...and {errors.length - 3} more collapsed</Text>}
    </Box>
  )
}

export default Errors
