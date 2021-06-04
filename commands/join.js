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
  const [initialScanComplete, setInitialScanComplete] = useState(false)
  const [errors, setErrors] = useState([])
  const addError = (err) => setErrors(errors => [...errors, err])

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

  // registry entries
  const { remoteRegistryTree, remoteRegistry, error, loading } = useHyper(
    sessionId,
    () => {
      setInitialScanComplete(true)
    }, addError)

  return (
    <CommandWrapper error={error} loading={loading}>
      {initialScanComplete ?
        <FileTree registry={remoteRegistryTree}/> :
        <Loader status='Waiting for remote...' />
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