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
  const { ready, registry, eventBus, replicate } = useHyper()
  const [loaded, setLoaded] = useState(false)

  // publish
  useEffect(() => {
    replicate(eventBus)
      .then(() => {
        registerWatcher(dir, data => {
          registry.parseEvt(data)
          setRegistryTree(registry.getTree())
          eventBus
            .append(JSON.stringify(data))
            .catch(err => console.error(`Could not append stats: ${err.toString}`))
        })
      })
  }, [])

  if (!ready) {
    return <Text>Establishing connection to hypercore...</Text>
  }

  return (
    <>
      <Title text="portal" sessionId={eventBus.key.toString('hex')}/>
      <FileTree registry={registryTree}>
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

