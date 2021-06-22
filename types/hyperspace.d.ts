// Incomplete type definitions extrapolated from API docs
// literally only here for my mental sanity, please don't actually use these
declare module 'hyperspace' {

  import Hyperdrive from 'hyperdrive'
  type FeedEventType =
        | 'peer-add'
        | 'peer-remove'
        | 'peer-open' // Peer channel has been fully opened.
        | 'ready' // Feed is ready and all properties have been populated.
        | 'error' // Feed experiences a critical error.
        | 'download' // Data block has been downloaded.
        | 'upload' // Data block is going to be uploaded
        | 'append' // Feed has been appended to (i.e. has a new length / byteLength).
        | 'sync' // Every time ALL data from 0 to feed.length has been downloaded.
        | 'close' // Feed has been fully closed
  class Feed {
    key: Buffer
    length: number

    ready(): Promise<void>
    append(value: string): Promise<void>
    get(start: number, end?: number): Promise<string>
    on(evt: FeedEventType, callback: () => void): void
  }

  interface ICoreStoreGetOptions {
    key?: Buffer;
    valueEncoding?: 'json' | 'utf-8' | 'binary';
  }
  class CoreStore {
    ready(): Promise<void>
    get(opt: ICoreStoreGetOptions): Feed
  }

  class Server {
    ready(): Promise<void>
    close(callback?: () => void): Promise<void>
  }

  class Client {
    ready(): Promise<void>
    close(callback?: () => void): Promise<void>
    replicate(src: Feed | Hyperdrive): Promise<void>

    corestore(): CoreStore
  }
}
