import {useRef, useState} from 'react'
import {Registry} from '../domain/registry'

// Hook to create a singleton value that does not ever get recreated
type ResultBox = {v: Registry}
export function useConstant(fn: () => Registry): Registry {
  const ref = useRef<ResultBox>()
  if (!ref.current) {
    ref.current = {v: fn()}
  }

  return ref.current.v
}

// Hook to easily track/add to error stack
export const useError = () => {
  const [errors, setErrors] = useState<string[]>([])
  const addError = (error: string) => {
    setErrors(errors => [...errors, error])
  }

  return {errors, addError}
}
