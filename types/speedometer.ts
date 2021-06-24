declare module 'speedometer' {
  // Returns bytes/s throughput
  type Speed = (byteDelta: number) => number

  // New speedometer
  function speedometer(bufferLength?: number): Speed
  export default speedometer
}
