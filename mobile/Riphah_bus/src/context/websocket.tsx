import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { backend } from "../config";
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
  useEffect(() => {
    if (!checkFlag) return
    const ws = new WebSocket(backend.replace("http","ws")+"/ws")
    wsRef.current = ws
    ws.onopen = () => {
      console.log("✅ WebSocket connected")
      ws.send(JSON.stringify({
        session_id: session_id
      }))
    }
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      console.log(data)
      if (data?.type === "notification"){
        // Notification Handler
      } else {
        if (callBack)
        callBack(data)
      }
    }
    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    }
    ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
      wsRef.current = null; // Clear ref on close
    }
    // Cleanup on unmount
    return () => {
      ws.close()
      wsRef.current = null
    };
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