// Incomplete type definitions extrapolated from API docs
// literally only here for my mental sanity, please don't actually use these
declare module 'hyperdrive' {
  import {CoreStore} from 'hyperspace'

    type Key = string | null | Buffer
    export interface IHyperDriveMetadata {
      key: Buffer;
    }
    class Hyperdrive {
      metadata: IHyperDriveMetadata
      promises: {
        ready(): Promise<void>;
        readFile(dir: string): Promise<Buffer>;
        writeFile(dir: string, buf: Buffer): Promise<void>;
      }
      constructor(core: CoreStore, key: Key)
    }

    export default Hyperdrive
}
