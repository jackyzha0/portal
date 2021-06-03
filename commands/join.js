import React, {useState} from "react";
import useHyper from "../hooks/useHyper.js";
import {SessionInfo, TitleCard} from '../components/Title'
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";
import Errors from "../components/Errors";
import useConstant from "../hooks/useConstant";
import {Registry} from "../fs/registry";
import CommandWrapper from "../components/CommandWrapper";
import {isEmpty} from "../fs/io";
import {Newline, Text} from "ink";

/// Joins an existing portal using a given `sessionId`
const Client = ({ dir, forceOverwrite, sessionId }) => {
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
  const remoteRegistry = useConstant(() => new Registry(addError))
  const [remoteRegistryTree, setRemoteRegistryTree] = useState([])

  const { error, loading } = useHyper(sessionId, ({eventLog}) => {
    const process = (data) => {
      remoteRegistry.parseEvt(JSON.parse(data))
      setRemoteRegistryTree(remoteRegistry.getTree())
    }

    // reconstruct file registry from event stream
    const dataPromises = []
    for (let i = 0; i < eventLog.length; i++) {
      dataPromises.push(eventLog.get(i))
    }
    Promise.all(dataPromises)
      .then(data => data.forEach(process))
      .then(() => {
        // setup registry tree
        setRemoteRegistryTree(remoteRegistry.getTree())

        // if we get a new block
        eventLog.on('append', async () => {
          const data = await eventLog.get(eventLog.length - 1)
          process(data)
        })

        eventLog.on('close', () => {
          console.log('stream closed')
        })

        // TODO: handle more feed events here
        // https://github.com/hypercore-protocol/hypercore#feedondownload-index-data
      })
  })

  return (
    <CommandWrapper error={error} loading={loading}>
      <TitleCard />
      <FileTree registry={remoteRegistryTree}/>
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