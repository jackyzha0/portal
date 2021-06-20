import {useEffect} from "react";
import * as path from "path";

export default (dir, registry, drive) => {
  useEffect(() => {
    if (registry && drive) {
      registry.setDrive(drive)
      registry.download()
      registry.addSubscriber(data => {
        const segments = data.path.split(path.sep)
        const node = registry.find(segments)
        if (node) {
          node.download()
        }
      })
    }
  }, [registry, drive])
}