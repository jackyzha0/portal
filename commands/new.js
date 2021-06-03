import React, {useState} from 'react';
import useHyper from "../hooks/useHyper.js";
import {SessionInfo} from '../components/Title'
import {Box} from "ink";
import PropTypes from "prop-types";
import FileTree from "../components/FileTree";
import Loader from "../components/Loader";
import useConstant from "../hooks/useConstant";
import {Registry} from "../fs/registry";
import Errors from "../components/Errors";
import CommandWrapper from "../components/CommandWrapper";

/// Creates a new portal in the given directory.
/// If no directory is provided, uses current working directory
const Host = ({dir}) => {
  const [initialScanComplete, setInitialScanComplete] = useState(false)
  const [errors, setErrors] = useState([])
  const addError = (err) => setErrors(errors => [...errors, err])

  // registry entries
  const localRegistry = useConstant(() => new Registry(addError))
  const [localRegistryTree, setLocalRegistryTree] = useState([])

  const { hyper, error, loading } = useHyper(undefined, ({eventLog, drive}) => {
    // link local registry to hypercore
    localRegistry.setDrive(drive)
    localRegistry.watch(
      dir,
      (data) => {
        // on change, push to hypercore
        eventLog
          .append(JSON.stringify(data))
          .catch(err => addError(`[eventLog]: ${err.toString()}`))
      },
      () => {
        // when finished initial scan, sync all to remote
        localRegistry.sync().then((tree) => setLocalRegistryTree(tree))
        setInitialScanComplete(true)
      },
    )
  })

  return (
    <CommandWrapper error={error} loading={loading}>
      <Box marginX={1} flexDirection="column">
        {initialScanComplete ?
          <FileTree registry={localRegistryTree}/> :
          <Loader status={`Scanning directory... ${localRegistry.size()} files found`} />
        }
        <SessionInfo sessionId={hyper?.eventLog?.key?.toString('hex')}/>
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

