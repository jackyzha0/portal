# portal
A two-way p2p folder syncing tool build on top of the hypercore protocol

### How it works
* watches for file changes and writes all changes to read-only log
* file structure/status is reconstructed from eventbus
* 