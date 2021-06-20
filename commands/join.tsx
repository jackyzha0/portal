import React from "react";
import useHyper from "../hooks/useHyper";
import {SessionInfo} from '../components/Title'
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";
import Errors from "../components/Errors";
import CommandWrapper from "../components/CommandWrapper";
import {isEmpty} from "../fs/io";
import {Newline, Text} from "ink";
import Loader from "../components/Loader";
import useRemoteRegistry from "../hooks/useRemoteRegistry";
import useDriveDownload from "../hooks/useDriveDownload";

interface IClientProps {
  dir: string,
  forceOverwrite: boolean,
  sessionId: string,
}

/// Joins an existing portal using a given `sessionId`
const Client = ({ dir, forceOverwrite, sessionId }: IClientProps) => {
  const hyper = useHyper(sessionId)
  const {errors, loading: remoteLoading, remoteRegistry, registryRenderableArray} = useRemoteRegistry(dir, hyper?.hyperObj?.eventLog)
  useDriveDownload(dir, remoteRegistry, hyper?.hyperObj?.drive)

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
      return <Loader status='Syncing remote hyperspace...' />
    } else {
      return <Loader status={`Scanning directory... ${registryRenderableArray.length} files found`} />
    }
  }

  return (
    <CommandWrapper error={hyper.error} loading={hyper.loading}>
      {!remoteLoading ?
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