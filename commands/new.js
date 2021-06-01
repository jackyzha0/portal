import React, {useState} from 'react';
import {registerWatcher} from "../fs/watcher.js";
import useHyper from "../hyper/useHyper.js";
import {SessionInfo, TitleCard} from '../components/Title'
import {Box, Text} from "ink";
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";
import Loader from "../components/Loader";

/// Creates a new portal in the given directory.
/// If no directory is provided, uses current working directory
const Host = ({dir}) => {
  const [registryTree, setRegistryTree] = useState([])
  const [initialScanComplete, setInitialScanComplete] = useState(false)
  const { hyper, error, loading } = useHyper(
    undefined,
    ({registry, eventBus}) => {
    registerWatcher(dir, data => {
      registry.parseEvt(data)
      setRegistryTree(registry.getTree())
      eventBus
        .append(JSON.stringify(data))
        .catch(err => console.error(`Could not append stats: ${err.toString}`))
    }, () => setInitialScanComplete(true))
  })

  if (loading) {
    return <Loader status="Initializing Hyperspace..." />
  }

  if (error) {
    return <Text>
      <Text color="red">Error connecting to hypercore: </Text>
      <Text>{error}</Text>
    </Text>
  }

  return (
    <>
      <TitleCard />
      <Box marginX={1} flexDirection="column">
        {initialScanComplete ?
          <FileTree registry={registryTree}/> :
          <Loader status={`Scanning directory... ${registryTree.length} files found`} />
        }
        <SessionInfo sessionId={hyper.eventBus.key.toString('hex')}/>
      </Box>
    </>
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

