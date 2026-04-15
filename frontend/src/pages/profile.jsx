import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import redirect from "../utils/redirect"
import makeRequest from "../utils/request"

function Profile(){
  const {session_id, user, checkFlag} = useContext(AuthContext)
  const {setLoading} = useContext(LoadingContext)
  const [group, setGroup] = useState("")
  const navigate = useNavigate()
  const loadData = async () => {
    if (!checkFlag) return
    setLoading(true)
    await redirect(user, navigate)
    await makeRequest(
      "auth/group/",
      "GET",
      session_id,
      null,
      (data) => setGroup(data.group),
      null,
      navigate
    )
    setLoading(false)
  }
  useEffect(() => {
    loadData()
  }, [checkFlag])
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header / Cover Area */}
          <div className="h-32 bg-(--accent-color)"></div>
          
          {/* Avatar */}
          <div className="flex justify-center -mt-12">
            <div className="rounded-full border-4 border-white bg-gray-200 w-24 h-24 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-gray-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 py-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-500 mt-1">User ID: {user?.id}</p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {group}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
export default Profile