import { useState, createContext, useEffect, useContext } from "react";
import { LoadingContext } from "./loading";
import makeRequest from "../utils/request";

const AuthContext = createContext({
  session_id: "",
  user: Object(null),
  permissions: Object(null),
  checkFlag: false,
  require_auth: async () => {},
  getPermission: async () => {}
})

function AuthProvider({ children }){
  let session_id = ""
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [checkFlag, setCheck] = useState(false)
  const {loading, setLoading} = useContext(LoadingContext)
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
  const require_auth = async () => {
    setLoading(true)
    await makeRequest(
      "auth/login/check/",
      "GET",
      session_id,
      null,
      (data) => {
        if (data.user){
          session_id = data.session_id
          setUser(data.user)
        } else {
          session_id = ""
          setUser(null)
        }
      },
      (res) => alert(res.detail)
    )
    if (user==null || user.reset_required){
      return
    }
    await getPermission()
  }
  useEffect(() => {
    require_auth()
    .then(() => {
      setCheck(true)
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