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
  const [permissions, setPermissions] = useState({})
  const [checkFlag, setCheck] = useState(false)
  const {setLoading} = useContext(LoadingContext)
  const loginCheck = async () => {
    setLoading(true)
    const res = await fetch(backend+api_prefix+"auth/login/check/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer "+session_id
      }
    })
    let data
    try{data = await res.json()} catch (e) {data = null}
    if (!res.ok){
      let msg = data.detail? data.detail : "Unexpected error occur. Please try again"
      alert(msg)
    } else if (data.user){
      session_id = data.session_id
      setUser(data.user)
      await getPermission()
    } else {
      session_id = ""
      setUser(null)
    }
    setLoading(false)
  }
  const getPermission = async () => {
    const res = await fetch(backend+api_prefix+"auth/permissions/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer "+session_id
      }
    })
    let data
    try {data = await res.json()} catch (e) {data = null}
    if (!res.ok){
      let msg = data.detail? data.detail : "Unexpected error occur. Please try again"
      alert(msg)
    } else if (data.permissions) {
      setPermissions(data.permissions)
    } else {
      setPermissions({})
    }
    return data
  }
  useEffect(() => {
    loginCheck()
    .then(() => setCheck(true))
  }, [])
  return (
    <AuthContext.Provider value={{session_id, user, permissions, checkFlag, loginCheck, getPermission}}>
      {children}
    </AuthContext.Provider>
  )
}

export {AuthContext, AuthProvider}