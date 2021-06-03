import React, {useEffect, useState} from 'react';
import useHyper from "../hooks/useHyper.js";
import {SessionInfo, TitleCard} from '../components/Title'
import {Box, Text} from "ink";
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";
import Loader from "../components/Loader";
import useConstant from "../hooks/useConstant";
import {Registry} from "../fs/registry";
import Errors from "../components/Errors";

/// Creates a new portal in the given directory.
/// If no directory is provided, uses current working directory
const Host = ({dir}) => {
  const [errors, setErrors] = useState([])
  const addError = (err) => setErrors(errors => [...errors, err])

  const localRegistry = useConstant(() => new Registry(addError))
  const [initialScanComplete, setInitialScanComplete] = useState(false)
  const { hyper, error, loading } = useHyper(undefined, ({eventLog, drive}) => {
    localRegistry.setDrive(drive)
    localRegistry.watch(
      dir,
      (data) => {
        eventLog
          .append(JSON.stringify(data))
          .catch(err => console.error(`Could not append event: ${err.toString()}`))
      },
      () => {
        localRegistry.sync()
        setInitialScanComplete(true)
      },
    )
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
          <FileTree registry={localRegistry.getTree()}/> :
          <Loader status={`Scanning directory... ${localRegistry.size()} files found`} />
        }
        <SessionInfo sessionId={hyper.eventLog.key.toString('hex')}/>
        <Errors errors={errors}/>
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

