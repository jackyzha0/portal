import {useEffect} from 'react'
import updateNotifier from 'update-notifier'
import pkg from '../package.json'

const useUpdateNotify = () => {
  useEffect(() => {
    updateNotifier({pkg}).notify()
  }, [])
}

export default useUpdateNotify
