import React from 'react'
import Loader from "./Loader";
import {Text} from "ink";
import {TitleCard} from "./Title";

export default ({loading, error, children}) => {
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