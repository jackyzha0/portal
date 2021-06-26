import React, {createContext, useContext, useMemo} from 'react'
import {Text} from 'ink'
import Loader from '../components/Loader'
import Hotkeys from '../components/Hotkeys'
import {IHyper, IHyperObject} from '../hooks/useHyper'

interface IAppContextProps {
  hyperObj?: IHyperObject;
  numConnected: number;
}
const AppContext = createContext<IAppContextProps>({
  numConnected: 0
})

export const useAppContext = () => useContext(AppContext)
interface IAppContextProviderProps {
  children: React.ReactNode;
  hyper: IHyper;
}
export const AppContextProvider = ({children, hyper}: IAppContextProviderProps) => {
  const contextValue = useMemo(() => ({
    hyperObj: hyper.hyperObj,
    numConnected: hyper.numConnected
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
        <Hotkeys close={hyper.hyperObj?.close}/>
      </>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
