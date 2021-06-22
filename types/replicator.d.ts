// Incomplete type definitions extrapolated from API docs
// literally only here for my mental sanity, please don't actually use these
declare module '@hyperswarm/replicator' {
  import {Feed} from "hyperspace";

  interface IReplicatorOptions {
    live: boolean,
  }
  class Replicator {
    add(ds: Feed, opts: IReplicatorOptions): Promise<void>
  }
  export default Replicator
}