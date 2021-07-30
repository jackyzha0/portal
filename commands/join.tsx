import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {Box, Newline, Text, useApp, useStdin} from 'ink'
import SelectInput from 'ink-select-input'
import useHyper from '../hooks/useHyper'
import {SessionInfo} from '../components/SessionInfo'
import FileTree from '../components/FileTree'
import Errors from '../components/Errors'
import {isEmpty} from '../fs/io'
import useRemoteRegistry from '../hooks/useRemoteRegistry'
import useDriveDownload from '../hooks/useDriveDownload'
import Hotkeys from '../components/Hotkeys'
import Stats from '../components/Stats'
import LoadingWrapper from '../components/LoadingWrapper'
import {AppContextProvider} from '../contexts/App'

interface IClientProps {
  dir: string;
  isForceOverwrite: boolean;
  sessionId: string;
  verbose: boolean;
  tree: boolean;
}

/// Joins an existing portal using a given `sessionId`
const Client = ({dir, isForceOverwrite, sessionId, verbose, tree}: IClientProps) => {
  const {exit} = useApp()
  const [isPaused, setIsPaused] = useState(!isEmpty(dir) && !isForceOverwrite)
  const {isRawModeSupported} = useStdin()

  const hyper = useHyper(sessionId)
  const {
    errors,
    loading: remoteLoading,
    remoteRegistry,
    registryRenderableArray,
    stats,
  } = useRemoteRegistry(dir, hyper.hyperObj?.eventLog, verbose, isPaused)
  useDriveDownload(dir, remoteRegistry, hyper.hyperObj?.drive)

  // Warning text for trying to sync in a non-empty directory
  if (isPaused) {
    return (
      <Box flexDirection="column">
        <Text bold color="yellow">Warning: </Text>
        <Text>There are already files in this directory! Syncing could overwrite these files</Text>
        <Newline/>
        {isRawModeSupported && <SelectInput
          items={[
            {
              label: 'Continue',
              value: true,
            }, {
              label: 'Cancel',
              value: false,
            },
          ]} onSelect={ack => {
            if (ack.value) {
              setIsPaused(false)
            } else {
              exit()
              process.exit()
            }
          }}/>}
        <Newline/>
        <Text dimColor>
          <Text>Tip! To force overwrite next time: </Text>
          <Text bold color="cyan"> portal join [sessionId] -f</Text>
        </Text>
      </Box>
    )
  }

  return (
    <AppContextProvider hyper={hyper}>
      <Box flexDirection="column">
        <SessionInfo numConnected={hyper.numConnected} sessionId={sessionId}/>
        <LoadingWrapper loading={remoteLoading} loadingMessage="Syncing remote hyperspace...">
          <FileTree registry={registryRenderableArray} full={tree}/>
          <Stats registry={registryRenderableArray} totalBytes={stats.totalBytes} bytesPerSecond={stats.bytesPerSecond}/>
        </LoadingWrapper>
        <Hotkeys/>
        <Errors errors={errors}/>
      </Box>
    </AppContextProvider>
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
  verbose: PropTypes.bool,

  /// Show full folder file tree
  tree: PropTypes.bool,
}
Client.shortFlags = {
  dir: 'd',
  isForceOverwrite: 'f',
  verbose: 'v',
  tree: 't',
}
Client.defaultProps = {
  dir: '.',
  isForceOverwrite: false,
  verbose: false,
  tree: false,
}

Client.positionalArgs = ['sessionId']
export default Client
