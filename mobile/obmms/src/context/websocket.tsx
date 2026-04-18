import { ReactNode, createContext, useState } from "react";
import { MRWSHandlerProvider } from "mr-wshandler-react";
import { backend, intervals } from "../config";

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
      }}
      onclose={() => {
        setStatus(false)
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