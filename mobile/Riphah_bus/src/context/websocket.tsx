import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { backend, intervals } from "../config";
import { AuthContext } from "./auth";

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
  const {session_id, checkFlag} = useContext(AuthContext)
  
  const connect = () => {
    if (!session_id) return

    // Close existing connections
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const ws = new WebSocket(backend.replace("http","ws") + "/ws")
    wsRef.current = ws

    ws.onopen = () => {
      console.log("✅ WebSocket connected")
      ws.send(JSON.stringify({ session_id }))
    }

    ws.onmessage = event => {
      const received = JSON.parse(event.data)
      if (received?.type === "notification") {
        // Handle notification
      } else {
        if (callBack) callBack(received)
      }
    }

    ws.onclose = event => {
      console.log(`❌ WebSocket closed: ${event.code} - ${event.reason}`)
      wsRef.current = null

      setTimeout(() => {
        console.log("🔄 Reconnecting...") // Debug print
        connect()
      }, intervals)
    }

    ws.onerror = e => {
      console.error("Websocekt error:",e)
    }
  }
  
  useEffect(() => {
    if (!checkFlag) return
    connect()
    return () => {
      if (wsRef.current){
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [checkFlag])
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