import {useEffect} from "react";
import * as path from "path";
import {Registry} from "../domain/registry";
import HyperDrive from "hyperdrive";

// Hook to subscribe to a registry and download on all changes
export default (dir: string, registry: Registry, drive: HyperDrive | undefined) => {
  useEffect(() => {
    if (registry && drive) {
      registry.setDrive(drive)
      registry.download()
      registry.addSubscriber(data => {
        if (data.status === "add" || data.status === "modify") {
          const segments = data.path.split(path.sep)
          const node = registry.find(segments)
          if (node) {
            node.download()
          }
        }
      })
    }
  }, [registry, drive])
}