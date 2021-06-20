// incomplete type definitions extrapolated from API docs
// literally only here for my mental sanity, please don't actually use these
declare module 'hyperspace' {
    import {IHyperDriveMetadata} from "hyperdrive";

    type FeedEventType =
        | 'peer-add'
        | 'peer-remove'
        | 'peer-open'   // peer channel has been fully opened.
        | 'ready'       // feed is ready and all properties have been populated.
        | 'error'       // feed experiences a critical error.
        | 'download'    // data block has been downloaded.
        | 'upload'      // data block is going to be uploaded
        | 'append'      // feed has been appended to (i.e. has a new length / byteLength).
        | 'sync'        // every time ALL data from 0 to feed.length has been downloaded.
        | 'close'       // feed has been fully closed
    class Feed {
        ready(): Promise<void>
        append(val: string): Promise<void>
        download(): Promise<void>
        get(start: number, end?: number): Promise<string>
        key: Buffer
        length: number
        on(evt: FeedEventType, callback: () => void): void
    }

    interface ICoreStoreGetOptions {
        key?: string,
        name?: string,
        valueEncoding?: 'json' | 'utf-8' | 'binary'
    }
    class CoreStore {
        ready(): Promise<void>
        get(opt: ICoreStoreGetOptions): Feed
    }

    class Server {
        ready(): Promise<void>
    }

    class Client {
        ready(): Promise<void>
        replicate(src: Feed | IHyperDriveMetadata): Promise<void>

        corestore(): CoreStore
    }
}