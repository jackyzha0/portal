import {useEffect} from "react";
import * as path from "path";
import {Registry} from "../domain/registry";
import HyperDrive from "hyperdrive";

export default (dir: string, registry: Registry, drive: HyperDrive | undefined) => {
  useEffect(() => {
    if (registry && drive) {
      registry.setDrive(drive)
      registry.sync()
      registry.addSubscriber(data => {
        const segments = data.path.split(path.sep)
        const node = registry.find(segments)
        if (node) {
          node.sync()
        }
      })
    }
  }, [registry, drive])
}