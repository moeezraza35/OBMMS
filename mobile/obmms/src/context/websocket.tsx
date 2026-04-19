import { ReactNode, createContext, useContext, useState } from "react";
import { MRWSHandlerProvider } from "mr-wshandler-react";
import { backend, intervals } from "../config";
import { NotificationContext } from "./notification";

type WebSocketType = {
  status: boolean
}
const WebSocketContext = createContext<WebSocketType>({
  status: false
})
function WebSocketProvider({ children }:{children:ReactNode}){
  const [status, setStatus] = useState<boolean>(false)
  const { handleNotification } = useContext(NotificationContext)
  
  return (
    <MRWSHandlerProvider
      server={backend.replace("http", "ws")+"/ws"}
      delay={intervals}
      onopen={() => {
        setStatus(true)
      }}
      onmessage={(msg) => {
        console.log("Message: ", msg) // Debug print
        const received = JSON.parse(msg)
        if (received?.type === "notification") {
          handleNotification("Package Status Changed", received?.message)
        }
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