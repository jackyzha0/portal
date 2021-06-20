import React from 'react'
import Loader from "./Loader";
import {Text} from "ink";

interface ICommandWrapperProps {
  loading: boolean,
  error: string,
  children?: React.ReactNode,
}

export default ({loading, error, children}: ICommandWrapperProps) => {
  if (loading) {
    return <Loader status="Initializing Hyperspace..." />
  }

  if (error) {
    return <Text>
      <Text color="red">Error connecting to hypercore: </Text>
      <Text>{error}</Text>
    </Text>
  }

  return (<>
    {children}
  </>)
}