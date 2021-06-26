import React from 'react'
import Loader from './Loader'

interface IDisplayComponentProps {
  loading: boolean;
  loadingMessage: string;
  children: React.ReactNode;
}

const DisplayComponent = ({loading, loadingMessage, children}: IDisplayComponentProps) => {
  return loading ?
    <Loader status={loadingMessage}/> :
    children
}

export default DisplayComponent
