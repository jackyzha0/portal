import {ITreeRepresentation, Registry} from "../domain/registry";
import {useEffect, useState} from "react";

const TARGET_REFRESH_RATE = 60
const useDebouncedState = (registry: Registry) => {
    const [registryRenderableArray, setRegistryRenderableArray] = useState<ITreeRepresentation[]>([])

    useEffect(() => {
        let handler: NodeJS.Timeout
        registry.onRerender(() => {
            if (handler) {
                clearTimeout(handler)
            } else {
                setRegistryRenderableArray(registry.getTree())
            }
            handler = setTimeout(() => {
                setRegistryRenderableArray(registry.getTree())
            }, 1000 / TARGET_REFRESH_RATE)
        })
    }, [])

    return registryRenderableArray
}

export default useDebouncedState