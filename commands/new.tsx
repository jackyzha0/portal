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

interface IHostProps {
  dir: string;
  includeGitFiles: boolean;
}

/// Creates a new portal from the given directory
const Host = ({dir, includeGitFiles}: IHostProps) => {
  const hyper = useHyper()
  const {errors, loading, localRegistry, registryRenderableArray} = useLocalRegistry(dir, hyper?.hyperObj?.eventLog, !includeGitFiles)
  useDriveSync(dir, localRegistry, hyper?.hyperObj?.drive)

  return (
    <CommandWrapper error={hyper.error} loading={hyper.loading}>
      <Box flexDirection="column">
        {loading ?
          <Loader status={`Scanning directory... ${registryRenderableArray.length} files found`}/> :
          <FileTree registry={registryRenderableArray}/>}
        <SessionInfo sessionId={hyper?.hyperObj?.eventLog?.key?.toString('hex')}/>
        <Errors errors={errors}/>
      </Box>
    </CommandWrapper>
  )
}

Host.propTypes = {
  /// Directory to create portal from. Defaults to current working directory
  dir: PropTypes.string,

  /// Include git dotfiles
  includeGitFiles: PropTypes.bool
}
Host.shortFlags = {
  dir: 'd'
}
Host.defaultProps = {
  dir: '.',
  includeGitFiles: false
}

export default Host

