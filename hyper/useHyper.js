import {useState} from "react";
import {Registry} from "../fs/registry.js";

export default (key) => {
  const [ready, setReady] = useState(false)

  // persist these vars
  const { corestore, replicate } = useState(new Client())[0]
  const store = useState(corestore())[0]
  const eventBus = useState(key ?
    store.get({ key: key, valueEncoding: 'json' }) :
    store.get({ name: 'eventBus', valueEncoding: 'json' }))[0]
  const registry = useState(new Registry())[0]

  return { ready, store, registry, eventBus, replicate }
}