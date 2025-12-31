import { createContext, useState } from "react";

const LoadingContext = createContext({
  loading: true,
  setLoading: () => {}
})

function LoadinProvider({ children }){
  const [loading, setLoading] = useState(true)
  return (
    <LoadingContext.Provider value={{loading, setLoading}}>
      {loading?<div className="loading">
        <img src="/images/icons/loading.svg"/>
      </div>:""}
      { children }
    </LoadingContext.Provider>
  )
}
export {LoadingContext, LoadinProvider}