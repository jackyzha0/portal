import {registerWatcher} from "../../fs/watcher.js";
import useHyper from "../../hyper/useHyper.js";
import {useEffect} from "react";
import Title from '../components/Title'

export default () => {
  const { ready, registry, eventBus, replicate } = useHyper(key)

  // in the future, maybe use https://www.npmjs.com/package/human-readable-ids
  console.log('Event Bus key is:', eventBus.key.toString('hex'))

  // publish
  useEffect(() => {
    replicate(eventBus)
      .then(() => {
        registerWatcher(dir, data => {
          registry.parseEvt(data)
          console.log('-------- update --------')
          console.log(registry.toString())
          eventBus
            .append(JSON.stringify(data))
            .catch(err => console.error(`Could not append stats: ${err.toString}`))
        })
      })
  })

  return <Title text="portal" />
}

