import React from 'react'
import {Box} from 'ink'
import Loader from './Loader'

interface IDisplayComponentProps {
  loading: boolean;
  loadingMessage: string;
  children: React.ReactNode;
}

const DisplayComponent = ({loading, loadingMessage, children}: IDisplayComponentProps) => loading
  ? <Loader status={loadingMessage}/>
  : <Box flexDirection="column">{children}</Box>

export default DisplayComponent
