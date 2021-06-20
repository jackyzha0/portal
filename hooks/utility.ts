import {useRef, useState} from "react";

type ResultBox<T> = { v: T }
export function useConstant<T>(fn: () => T): T {
  const ref = useRef<ResultBox<T>>()

  if (!ref.current) {
    ref.current = { v: fn() }
  }

  return ref.current.v
}

export const useError = () => {
  const [errors, setErrors] = useState<string[]>([])
  const addError = (err: string) => setErrors(errors => [...errors, err])
  return {errors, addError}
}