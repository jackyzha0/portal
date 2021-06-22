// Incomplete type definitions extrapolated from API docs
// literally only here for my mental sanity, please don't actually use these
declare module 'hyperdrive' {
  import * as stream from 'stream'
  import {CoreStore} from 'hyperspace'

    type Key = string | null | Buffer
    class Hyperdrive {
      key: Buffer
      peer: any[]
      promises: {
        ready(): Promise<void>;
        readFile(dir: string): Promise<Buffer>;
        writeFile(dir: string, buf: Buffer): Promise<void>;
        rmdir(dir: string): Promise<void>;
        unlink(dir: string): Promise<void>;
      }
      constructor(core: CoreStore, key: Key)
      createWriteStream(name: string): stream.Writable
      createReadStream(name: string): stream.Readable
    }

    export default Hyperdrive
}
