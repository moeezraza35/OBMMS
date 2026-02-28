import { createContext, ReactNode, useState } from "react";
import { Image, View } from "react-native";

interface LoadingContextType {
  loading: boolean,
  setLoading: Function
}
const LoadingContext = createContext<LoadingContextType>({
  loading: true,
  setLoading: () => {}
})
function LoadingProvider({ children }: { children: ReactNode }){
  const [loading, setLoading] = useState(true)
  return (
    <LoadingContext.Provider value={{loading, setLoading}}>
      <View style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(255,255,255,0.5)",
        zIndex: 9999,
        display: loading ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center"}}>
        <Image source={require("../assets/images/logo.png")} style={{width: 100, height: 100, alignSelf: "center"}} />
      </View>
      { children }
    </LoadingContext.Provider>
  )
}
export {LoadingContext, LoadingProvider}