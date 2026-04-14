import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { MRWSHandlerContext, MRWSHandlerProvider } from "mr-wshandler-react";
import { backend, intervals } from "../config";
import { AuthContext } from "./auth";

type WebSocketType = {
  status: boolean
}
const WebSocketContext = createContext<WebSocketType>({
  status: false
})
function WebSocketProvider({ children }:{children:ReactNode}){
  const [status, setStatus] = useState<boolean>(false)
  
  return (
    <MRWSHandlerProvider
      server={backend.replace("http", "ws")+"/ws"}
      delay={intervals}
      onopen={() => {
        setStatus(true)
        console.log("Connection open...") // Debug print
      }}
      onclose={() => {
        setStatus(false)
        console.log("Connection close...")  // Debug print
      }}>
      <WebSocketContext.Provider value={{
        status: status
      }}>
        { children }
      </WebSocketContext.Provider>
    </MRWSHandlerProvider>
  )
}
export {WebSocketContext, WebSocketProvider}