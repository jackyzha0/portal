# portal
A two-way p2p folder syncing tool build on top of the [Hypercore protocol](https://hypercore-protocol.org/).

## TODO:
- [ ] useContext and useCallback where appropriatef
- [x] proper close handling 
- [ ] flag to hide file tree
- [ ] impl states for uploading/waiting for remote to upload
    - [ ] add retry/backoff to remote to upload
- [ ] unix piping
- [ ] tests :((
    - [ ] hooks → https://github.com/testing-library/react-hooks-testing-library
    - [ ] components → https://github.com/vadimdemedes/ink-testing-library
    - [ ] registry → regular ava
- [ ] packaging + redistribution
    - [ ] update notifier: https://www.npmjs.com/package/update-notifier
- [ ] write readme
    - [ ] demo video

## Features
read/write streams for files of arbitrary size
differences vs dat
ephemeral, async, zero-config, zero-manifest
https://docs.datproject.org/docs/faq