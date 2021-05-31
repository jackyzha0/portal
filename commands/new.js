import React, {useState} from 'react';
import {registerWatcher} from "../fs/watcher.js";
import useHyper from "../hyper/useHyper.js";
import {useEffect} from "react";
import Title from '../components/Title'
import {Box, Text} from "ink";
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";

const Host = ({dir}) => {
  const [registryTree, setRegistryTree] = useState([])
  const { hyper, error, loading } = useHyper(
    undefined,
    ({registry, eventBus}) => {
    registerWatcher(dir, data => {
      registry.parseEvt(data)
      setRegistryTree(registry.getTree())
      eventBus
        .append(JSON.stringify(data))
        .catch(err => console.error(`Could not append stats: ${err.toString}`))
    })
  })

  if (loading) {
    return <Text>Establishing connection to hypercore...</Text>
  }

  if (error) {
    return <Text>
      <Text color="red">Error connecting to hypercore: </Text>
      <Text>{error}</Text>
    </Text>
  }

  return (
    <>
      <Title text="portal" sessionId={hyper.eventBus.key.toString('hex')}/>
      <FileTree registry={registryTree}/>
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

