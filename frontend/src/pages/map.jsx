import { useContext, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import Location from "../components/location"
import makeRequest from "../utils/request"

function Map(){
  const {setLoading} = useContext(LoadingContext)
  const {user, checkFlag} = useContext(AuthContext)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const loadData = async () => {
    if (!checkFlag) return
    const session_id = params.get("session_id")
    console.log("Session ID =",session_id)
    if (user===null){
      await makeRequest(
        "auth/login/check/",
        "GET",
        session_id,
        null,
        (data) => {console.log(data.user)},
        null,
        navigate
      )
    }
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <div id="map" className="h-screen">
      <Location width="100%" height="100vh"></Location>
    </div>
  )
}
export default Map