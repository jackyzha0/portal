import React, {createContext, useContext, useMemo, useState} from 'react'
import {Text} from 'ink'
import Loader from '../components/Loader'
import Hotkeys from '../components/Hotkeys'
import {IHyper, IHyperObject} from '../hooks/useHyper'
import useUpdateNotify from '../hooks/useUpdateNotify'

interface IAppContextProps {
  hyperObj?: IHyperObject;
  numConnected: number;
  closed: boolean;
  setClosed: () => void;
}

// default AppContext
const AppContext = createContext<IAppContextProps>({
  numConnected: 0,
  closed: false,
  setClosed: () => {},
})

export const useAppContext = () => useContext(AppContext)
interface IAppContextProviderProps {
  children: React.ReactNode;
  hyper: IHyper;
}
export const AppContextProvider = ({children, hyper}: IAppContextProviderProps) => {
  useUpdateNotify()

  const [closed, setClosed] = useState(false)

  // assign memoized context value
  const contextValue = useMemo(() => ({
    hyperObj: hyper.hyperObj,
    numConnected: hyper.numConnected,
    closed,
    setClosed: () => {
      setClosed(true)
    },
  }), [hyper])

  if (hyper.loading) {
    return <Loader status="Initializing Hyperspace..."/>
  }

  if (hyper.error) {
    return (
      <>
        <Text>
          <Text color="red">Error connecting to hypercore: </Text>
          <Text>{hyper.error}</Text>
        </Text>
        <Hotkeys/>
      </>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
