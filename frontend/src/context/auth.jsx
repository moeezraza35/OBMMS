import { useState, createContext, useEffect, useContext } from "react";
import { backend, api_prefix } from "../config";
import { LoadingContext } from "./loading";

const AuthContext = createContext({
  session_id: "",
  user: Object(null),
  loginCheck: () => {}
})

function AuthProvider({ children }){
  let session_id = ""
  const [user, setUser] = useState(null)
  const {setLoading} = useContext(LoadingContext)
  const loginCheck = () => {
    setLoading(true)
    fetch(backend+api_prefix+"auth/login/check/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer "+session_id
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data["user"] != null){
        session_id = data["session_id"]
        setUser(data["user"])
      } else {
        session_id = ""
        setUser(null)
      }
      setLoading(false)
    })
    .catch(e => console.log("Error in checking session",e))
  }
  useEffect(() => {
    loginCheck()
  }, [])
  return (
    <AuthContext.Provider value={{session_id, user, loginCheck}}>
      {children}
    </AuthContext.Provider>
  )
}

export {AuthContext, AuthProvider}