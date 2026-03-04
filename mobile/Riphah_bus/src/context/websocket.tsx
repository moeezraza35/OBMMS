import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { backend } from "../config";

type WebSocketType = {
  ws: WebSocket|null,
  callBack: Function,
  setCallBack: Function,
}
const WebSocketContext = createContext<WebSocketType>({
  ws: null,
  callBack: () => {},
  setCallBack: () => {}
})
function WebSocketProvider({ children }:{children:ReactNode}){
  const wsRef = useRef<WebSocket|null>(null)
  const [callBack, setCallBack] = useState<Function>(() => {})
  useEffect(() => {
    const ws = new WebSocket(backend.replace("http","ws")+"/ws")
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data?.type === "notification"){
        // Notification Handler
      } else {
        callBack(data)
      }
    }
  }, [])
  return (
    <WebSocketContext.Provider value={{
      ws: wsRef.current,
      callBack: callBack,
      setCallBack: setCallBack
    }}>
      { children }
    </WebSocketContext.Provider>
  )
}
export {WebSocketContext, WebSocketProvider}