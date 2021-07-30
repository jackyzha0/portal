import React from 'react'
import {Box} from 'ink'
import Loader from './Loader'

interface IDisplayComponentProps {
  loading: boolean;
  loadingMessage: string;
  children: React.ReactNode;
}

// Component to wrap potentially loading components
const LoadingWrapper = ({loading, loadingMessage, children}: IDisplayComponentProps) => loading
  ? <Loader status={loadingMessage}/>
  : <Box flexDirection="column">{children}</Box>

export default LoadingWrapper
