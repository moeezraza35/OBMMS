import { createContext, useContext, useEffect, useRef, useState } from "react";
import { backend } from "../config";
import { AuthContext } from "./auth";

const WebSocketContext = createContext({
  ws: null,
  data: null,
  callback: () => {},
  setCallBack: () => {}
})
function WebSocketProvider({ children }){
  const wsRef = useRef(null)
  const [data, setData] = useState()
  const [callBack, setCallBack] = useState(() => {})
  const {session_id, checkFlag} = useContext(AuthContext)
  useEffect(() => {
    if (!checkFlag) return
    const ws = new WebSocket(backend.replace("http", "ws")+"/ws")
    ws.onopen = () => {
      console.log("✅ WebSocket connected")  // Debug Print
      ws.send(JSON.stringify({
        session_id: session_id
      }));
    };
    ws.onmessage = (event) => {
      const dataReceived = JSON.parse(event.data)
      if (dataReceived?.type == "notification") {
        // Handle Notification
      } else {
        setData(dataReceived)
      }
    }
    ws.onclose = () => {
      console.log("❌ WebSocket closed")  // Debug print
    }
    wsRef.current = ws
    return () => ws.close()
  }, [checkFlag])
  return (
    <WebSocketContext.Provider value={{
      ws: wsRef.current,
      data: data,
      callback: callBack,
      setCallBack: setCallBack
    }}>
      { children }
    </WebSocketContext.Provider>
  )
}
export {WebSocketContext, WebSocketProvider}