import React from 'react'
import {Box} from 'ink'
import PropTypes from 'prop-types'
import useHyper from '../hooks/useHyper'
import {SessionInfo} from '../components/SessionInfo'
import FileTree from '../components/FileTree'
import Loader from '../components/Loader'
import Errors from '../components/Errors'
import CommandWrapper from '../components/CommandWrapper'
import useLocalRegistry from '../hooks/useLocalRegistry'
import useDriveSync from '../hooks/useDriveSync'
import Hotkeys from '../components/Hotkeys'
import Stats from '../components/Stats'

interface IHostProps {
  dir: string;
  includeGitFiles: boolean;
  verbose: boolean;
}

/// Creates a new portal from the given directory
const Host = ({dir, includeGitFiles, verbose}: IHostProps) => {
  const hyper = useHyper()
  const {
    errors,
    loading,
    localRegistry,
    registryRenderableArray,
    stats
  } = useLocalRegistry(dir, hyper?.hyperObj?.eventLog, !includeGitFiles, verbose)
  useDriveSync(dir, localRegistry, hyper?.hyperObj?.drive)

  const DisplayComponent = () => {
    if (loading) {
      return <Loader status={`Scanning directory... ${registryRenderableArray.length} files found`}/>
    }

    return (
      <>
        <FileTree registry={registryRenderableArray}/>
        <Stats totalBytes={stats.totalBytes} bytesPerSecond={stats.bytesPerSecond}/>
      </>
    )
  }

  return (
    <CommandWrapper error={hyper.error} loading={hyper.loading}>
      <Box flexDirection="column">
        <DisplayComponent/>
        <SessionInfo numConnected={hyper.numConnected} sessionId={hyper?.hyperObj?.eventLog?.key?.toString('hex')}/>
        <Hotkeys/>
        <Errors errors={errors}/>
      </Box>
    </CommandWrapper>
  )
}

Host.propTypes = {
  /// Directory to create portal from. Defaults to current working directory
  dir: PropTypes.string,

  /// Include git dotfiles
  includeGitFiles: PropTypes.bool,

  /// Verbose mode
  verbose: PropTypes.bool
}
Host.shortFlags = {
  dir: 'd',
  verbose: 'v'
}
Host.defaultProps = {
  dir: '.',
  includeGitFiles: false,
  verbose: false
}

export default Host

