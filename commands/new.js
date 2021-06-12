import React from 'react';
import useHyper from "../hooks/useHyper.js";
import {SessionInfo} from '../components/Title'
import {Box} from "ink";
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";
import Loader from "../components/Loader";
import Errors from "../components/Errors";
import CommandWrapper from "../components/CommandWrapper";
import useLocalRegistry from "../hooks/useLocalRegistry";
import useIoReader from "../hooks/useIoReader";

/// Creates a new portal in the given directory.
/// If no directory is provided, uses current working directory
const Host = ({dir}) => {
  const hyper = useHyper()
  const {errors, loading, localRegistry, registryRenderableArray} = useLocalRegistry(dir, hyper?.hyperObj?.eventLog)
  useIoReader(dir, localRegistry, hyper?.hyperObj?.drive)

  return (
    <CommandWrapper error={hyper.error} loading={hyper.loading}>
      <Box marginX={1} flexDirection="column">
        {loading ?
          <FileTree registry={registryRenderableArray}/> :
          <Loader status={`Scanning directory... ${registryRenderableArray.size()} files found`} />
        }
        <SessionInfo sessionId={hyper?.hyperObj?.eventLog?.key?.toString('hex')}/>
        <Errors errors={errors}/>
      </Box>
    </CommandWrapper>
  )
}

Host.propTypes = {
  dir: PropTypes.string,
};
Host.shortFlags = {
  dir: 'd'
};
Host.defaultProps = {
  dir: '.'
};

export default Host

