import {useRef} from "react";

export default (valFn) => {
  const ref = useRef({v: undefined})

  if (!ref.current?.v) {
    ref.current = {v: valFn()}
  }

  return ref.current.v
}