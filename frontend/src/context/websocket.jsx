import { createContext, useEffect, useRef, useState } from "react";
import { backend } from "../config";

const WebSocketContext = createContext({
  ws: null,
  callback: () => {},
  setCallBack: () => {}
})
function WebSocketProvider({ children }){
  const wsRef = useRef(null)
  const [callBack, setCallBack] = useState(() => {})
  useEffect(() => {
    const ws = new WebSocket(backend.replace("http", "ws")+"/ws")
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data?.type == "notification") {
        // Handle Notification
      } else {
        callBack(data)
      }
    }
    wsRef.current = ws
    return () => ws.close()
  }, [])
  return (
    <WebSocketContext.Provider value={{
      ws: wsRef.current,
      callback: callBack,
      setCallBack: setCallBack
    }}>
      { children }
    </WebSocketContext.Provider>
  )
}
export {WebSocketContext, WebSocketProvider}