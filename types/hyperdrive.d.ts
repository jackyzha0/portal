declare module 'hyperdrive' {
    import {CoreStore} from "hyperspace";

    type Key = string | null | Buffer
    export interface IHyperDriveMetadata {
        key: Buffer,
    }
    class Hyperdrive {
        constructor(core: CoreStore, key: Key)
        metadata: IHyperDriveMetadata
        promises: {
            ready(): Promise<void>
            readFile(dir: string): Promise<Buffer>
            writeFile(dir: string, buf: Buffer): Promise<void>
        }
    }

    export default Hyperdrive
}