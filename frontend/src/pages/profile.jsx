import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import redirect from "../utils/redirect"

function Profile(){
  const {user, checkFlag} = useContext(AuthContext)
  const {setLoading} = useContext(LoadingContext)
  const navigate = useNavigate()
  const loadData = async () => {
    if (!checkFlag) return
    await redirect(user, navigate)
    // setLoading(true)
  }
  useEffect(loadData, [checkFlag])
  return (
    <main><h1>Profile Page</h1></main>
  )
}
export default Profile