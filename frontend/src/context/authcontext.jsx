import { useState, createContext } from "react";

const AuthContext = createContext(null)

function AuthProvider(){
  const [user, setUser] = useState(null)
  return (
    <AuthContext.Provider value={user}></AuthContext.Provider>
  )
}

export {AuthContext, AuthProvider}