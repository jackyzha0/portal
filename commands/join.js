import React, {useEffect} from "react";
import useHyper from "../hyper/useHyper.js";
import Title from '../components/Title'
import PropTypes from "prop-types";

const Client = ({ sessionId }) => {
  const { ready, registry, eventBus, replicate } = useHyper(sessionId)
  const process = (data) => {
    registry.parseEvt(JSON.parse(data))
  }

  useEffect(() => {
    // sync down and preload
    console.log('replicating from main host')
    replicate(eventBus)
      .then(() => eventBus.download())
      .then(() => {
        // reconstruct file registry from event stream
        const dataPromises = []
        for (let i = 0; i < eventBus.length; i++) {
          dataPromises.push(eventBus.get(i))
        }
        return Promise.all(dataPromises).then(
          data => data.forEach(process)
        )
      })
      .then(() => console.log(registry.toString()))
      .then(() => {
        // setup listeners

        // if we get a new block
        eventBus.on('append', async () => {
          const data = await eventBus.get(eventBus.length - 1)
          process(data)
          console.log('-------- update --------')
          console.log(registry.toString())
        })

        eventBus.on('close', () => {
          console.log('stream closed')
        })
      })
  }, [])

  // TODO: handle more feed events here
  // https://github.com/hypercore-protocol/hypercore#feedondownload-index-data

  return <Title text="portal" />
}

Client.propTypes = {
  sessionId: PropTypes.string.isRequired,
};

Client.positionalArgs = ['sessionId'];
export default Client