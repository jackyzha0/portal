import {useRef, useState} from "react";

export const useConstant = (fn) => {
  const ref = useRef({v: undefined})

  if (!ref.current.v) {
    ref.current = { v: fn() }
  }

  return ref.current.v
}

export const useError = () => {
  const [errors, setErrors] = useState([])
  const addError = (err) => setErrors(errors => [...errors, err])
  return {errors, addError}
}