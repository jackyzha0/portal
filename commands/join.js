import React, {useState} from "react";
import useHyper from "../hooks/useHyper.js";
import {SessionInfo} from '../components/Title'
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";
import Errors from "../components/Errors";
import useConstant from "../hooks/useConstant";
import {Registry} from "../fs/registry";
import CommandWrapper from "../components/CommandWrapper";
import {isEmpty} from "../fs/io";
import {Box, Newline, Text} from "ink";
import Loader from "../components/Loader";

/// Joins an existing portal using a given `sessionId`
const Client = ({ dir, forceOverwrite, sessionId }) => {
  const hyper = useHyper(sessionId)
  const {errors: remoteRegistryErrors, loading: remoteLoading, remoteRegistry, registryRenderableArray} = useRemoteRegistry(dir, hyper)
  const {errors: localRegistryErrors, loading: localLoading, localRegistry} = useLocalRegistry(dir)
  const diffList = useDiff(remoteRegistry, localRegistry)
  const {errors: ioErrors} = useIoWriter(dir, diffList, hyper)
  const errors = [...remoteRegistryErrors, ...localRegistryErrors, ...ioErrors]

  // warning text for trying to sync in a non-empty directory
  if (isEmpty(dir) && !forceOverwrite) {
    return <Text>
      <Text color="yellow" bold>Warning: </Text>
      <Text>There are already files in this directory! Syncing could overwrite these files</Text>
      <Newline />
      <Text dimColor>
        <Text>To force overwrite: </Text>
        <Text color="cyan" bold> portal join [sessionId] -f</Text>
      </Text>
    </Text>
  }

  const getLoader = () => {
    if (remoteLoading) {
      return <Loader status='Waiting for remote hyperspace...' />
    } else {
      return <Loader status={`Scanning directory... ${registryRenderableArray.size()} files found`} />
    }
  }

  return (
    <CommandWrapper error={hyper.error} loading={hyper.loading}>
      {!(remoteLoading && localLoading) ?
        <FileTree registry={registryRenderableArray}/> :
        getLoader()
      }
      <SessionInfo sessionId={sessionId}/>
      <Errors errors={errors}/>
    </CommandWrapper>
  )
}

Client.propTypes = {
  sessionId: PropTypes.string.isRequired,
  dir: PropTypes.string,
  forceOverwrite: PropTypes.bool,
};
Client.shortFlags = {
  dir: 'd',
  forceOverwrite: 'f',
};
Client.defaultProps = {
  dir: '.',
  forceOverwrite: false,
};

Client.positionalArgs = ['sessionId'];
export default Client