import { useState, createContext, useEffect, useContext } from "react";
import { LoadingContext } from "./loading";
import makeRequest from "../utils/request";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  session_id: "",
  user: Object(null),
  permissions: Object(null),
  checkFlag: false,
  setSessionID: () => {},
  require_auth: async () => {},
  getPermission: async () => {}
})

function AuthProvider({ children }){
  const [session_id, setSessionID] = useState("")
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [checkFlag, setCheck] = useState(false)
  const {setLoading} = useContext(LoadingContext)
  const navigate = useNavigate()
  const getPermission = async () => {
    const resData = await makeRequest(
      "auth/permissions/",
      "GET",
      session_id,
      null,
      (data) => {
        if (data.permissions) {
          setPermissions(data.permissions)
        } else {
          setPermissions({})
        }
      },
      (res) => alert(res.detail)
    )
    return resData
  }
  const require_auth = async (sid) => {
    setLoading(true)
    setCheck(false)
    await makeRequest(
      "auth/login/check/",
      "GET",
      sid,
      null,
      async (data) => {
        if (data.user){
          setSessionID(data.session_id)
          setUser(data.user)
          await getPermission()
        } else {
          setSessionID("")
          setUser(null)
        }
        setCheck(true)
      },
      null,
      navigate
    )
  }
  useEffect(() => {
    require_auth()
    .then(() => {
      setLoading(false)
    })
  }, [])
  return (
    <AuthContext.Provider value={{session_id, user, permissions, checkFlag, require_auth, getPermission}}>
      {children}
    </AuthContext.Provider>
  )
}

export {AuthContext, AuthProvider}