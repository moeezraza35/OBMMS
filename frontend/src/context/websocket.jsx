import { createContext, useContext, useEffect, useRef, useState } from "react"
import { backend } from "../config"
import { AuthContext } from "./auth"
import { LoadingContext } from "./loading"

const WebSocketContext = createContext({
  ws: null,
  data: null,
  callback: () => {},
  setCallBack: () => {}
})

function WebSocketProvider({ children }) {
  const wsRef = useRef(null)
  const [data, setData] = useState()
  const [callBack, setCallBack] = useState(() => {})
  const { session_id, checkFlag } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)

  const connect = () => {
    if (!session_id) return

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const ws = new WebSocket(backend.replace("http", "ws") + "/ws")
    wsRef.current = ws

    ws.onopen = () => {
      console.log("✅ WebSocket connected")
      // Send authentication
      ws.send(JSON.stringify({ session_id }))
    }

    ws.onmessage = (event) => {
      const received = JSON.parse(event.data)
      if (received?.type === "notification") {
        // Handle notification
      } else {
        setData(received)
        // If you need to call a dynamic callback, use a ref as before
        if (callBack) callBack(received)
      }
    }

    ws.onclose = (event) => {
      console.log(`❌ WebSocket closed: ${event.code} - ${event.reason}`)
      wsRef.current = null

      // Reconnect after delay (unless it was a normal closure)
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log("🔄 Reconnecting...") // Debug print
          connect()
        }, 3000)
      }
    }

    ws.onerror = (e) => {
      console.warn("⚠️ WebSocket error:", e)
      // The `onclose` will trigger after error, so reconnection is handled there
    }
  }

  useEffect(() => {
    if (!checkFlag || !session_id) return
    setLoading(true)
    connect()
    setLoading(false)

    // Cleanup on unmount or when session changes
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [checkFlag]) // Reconnect when session changes

  return (
    <WebSocketContext.Provider value={{
      ws: wsRef.current,
      data,
      callback: callBack,
      setCallBack
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export { WebSocketContext, WebSocketProvider }