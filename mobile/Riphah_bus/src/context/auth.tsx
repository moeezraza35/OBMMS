import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as Keychain from "react-native-keychain"
import { makeRequest } from "../utils/request";
import { LoadingContext } from "./loading";
import { Alert } from "react-native";
import { navigate } from "../utils/navigation";

type User = {
  "id": Number,
  "name": string,
  "reset_required": Boolean,
  "group": Number,
  "is_admin": Boolean
}

interface AuthContextType {
  session_id: string
  setSessionId: Function
  user: User | null
  setUser: Function
  permissions: Object
  checkFlag: boolean
  require_auth: Function
}

const AuthContext = createContext<AuthContextType>({
  session_id: "",
  setSessionId: () => {},
  user: null,
  setUser: () => {},
  permissions: {},
  checkFlag: false,
  require_auth: () => {}
})

function AuthProvider({ children }: { children: ReactNode }){
  const [user, setUser] = useState<User|null>(null)
  const [permissions, setPermissions] = useState<Object>({})
  const [checkFlag, setCheckFlag] = useState(false)
  const [session_id, setSessionId] = useState<string>("")
  const {setLoading} = useContext(LoadingContext)
  const require_auth = async (session_id:string) => {
    await makeRequest(
      "auth/login/check/",
      "GET",
      "Bearer "+session_id,
      null,
      (data:{user:User|null, session_id:string}) => {
        setUser(data.user)
        setSessionId(data.session_id)
        if (data.user?.reset_required){
          navigate("Password");
        } else {
          if (data.user?.name){
            Keychain.setGenericPassword(data.user.name, data.session_id)
          }
          getPermission(session_id)
        }
      },
      (e:any) => {Alert.alert("Connection Error","Make sure you're connected to internet "+e)}
    )
  }
  const getPermission = async (session_id:string) => {
    await makeRequest(
      "auth/permissions/",
      "GET",
      "Bearer "+session_id,
      null,
      (data:{permissions:Object}) => setPermissions(data.permissions),
      (e:any) => {Alert.alert("Connection Error","Make sure you're connected to internet "+e)}
    )
  }
  const LoadData = async () => {
    const credentials = await Keychain.getGenericPassword()
    if (credentials){
      setLoading(true)
      await require_auth(credentials.password)
    } else {
      navigate("Login");
    }
    setLoading(false)
    setCheckFlag(true)
  }
  useEffect(() => {
    LoadData()
  }, [])
  return (
    <AuthContext.Provider value={{
      session_id: session_id,
      setSessionId: setSessionId,
      user: user,
      setUser: setUser,
      permissions: permissions,
      checkFlag: checkFlag,
      require_auth: require_auth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
export { AuthContext, AuthProvider }