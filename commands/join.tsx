import React from 'react'
import PropTypes from 'prop-types'
import {Box, Newline, Text} from 'ink'
import useHyper from '../hooks/useHyper'
import {SessionInfo} from '../components/SessionInfo'
import FileTree from '../components/FileTree'
import Errors from '../components/Errors'
import CommandWrapper from '../components/CommandWrapper'
import {isEmpty} from '../fs/io'
import Loader from '../components/Loader'
import useRemoteRegistry from '../hooks/useRemoteRegistry'
import useDriveDownload from '../hooks/useDriveDownload'

interface IClientProps {
  dir: string;
  isForceOverwrite: boolean;
  sessionId: string;
  verbose: boolean;
}

/// Joins an existing portal using a given `sessionId`
const Client = ({dir, isForceOverwrite, sessionId, verbose}: IClientProps) => {
  const hyper = useHyper(sessionId)
  const {errors, loading: remoteLoading, remoteRegistry, registryRenderableArray} = useRemoteRegistry(dir, hyper?.hyperObj?.eventLog, verbose)
  useDriveDownload(dir, remoteRegistry, hyper?.hyperObj?.drive)

  // Warning text for trying to sync in a non-empty directory
  if (isEmpty(dir) && !isForceOverwrite) {
    return (
      <Text>
        <Text bold color="yellow">Warning: </Text>
        <Text>There are already files in this directory! Syncing could overwrite these files</Text>
        <Newline/>
        <Text dimColor>
          <Text>To force overwrite: </Text>
          <Text bold color="cyan"> portal join [sessionId] -f</Text>
        </Text>
      </Text>
    )
  }

  return (
    <CommandWrapper error={hyper.error} loading={hyper.loading}>
      <Box flexDirection="column">
        {remoteLoading ?
          <Loader status="Syncing remote hyperspace..."/> :
          <FileTree registry={registryRenderableArray}/>}
        <SessionInfo sessionId={sessionId}/>
        <Errors errors={errors}/>
      </Box>
    </CommandWrapper>
  )
}

Client.propTypes = {
  /// Session ID of portal to join
  sessionId: PropTypes.string.isRequired,

  /// Directory to sync files to. Defaults to current working directory
  dir: PropTypes.string,

  /// Whether to overwrite current files in directory
  isForceOverwrite: PropTypes.bool,

  /// Verbose mode
  verbose: PropTypes.bool
}
Client.shortFlags = {
  dir: 'd',
  isForceOverwrite: 'f',
  verbose: 'v'
}
Client.defaultProps = {
  dir: '.',
  isForceOverwrite: false,
  verbose: false
}

Client.positionalArgs = ['sessionId']
export default Client
