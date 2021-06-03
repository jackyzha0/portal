# portal
A two-way p2p folder syncing tool build on top of the hypercore protocol

### How it works
* watches for file changes and writes all changes to distributed read-only log (hypercore)
* file structure/status is reconstructed on each client from eventlog
* each client keeps local file structure in local registry, diffs for changes, and propogates changes to disk