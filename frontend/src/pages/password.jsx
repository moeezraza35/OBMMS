import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/auth"
import { useNavigate } from "react-router-dom"
import { LoadingContext } from "../context/loading"
import makeRequest from "../utils/request"
import redirect from "../utils/redirect"

function Password(){
  const {session_id, user, checkFlag, require_auth} = useContext(AuthContext)
  const {setLoading} = useContext(LoadingContext)
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShow] = useState(false)
  const LoadData = async () => {
    if (!checkFlag) return
    setLoading(true)
    await redirect(user, navigate)
  }
  useEffect(() => {
    LoadData()
    .then(() => setLoading(false))
  }, [checkFlag])
  return (
    <main className="pt-28">
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          if (password !== confirm){
            console.log(password, confirm)
            alert("Password and confirm password doesn't matched")
            setLoading(false)
            return
          }
          await makeRequest(
            "auth/change_password/",
            "POST",
            session_id,
            {"password": password},
            async () => {
              await require_auth(session_id)
              navigate("/dashboard/")
            },
            null,
            navigate
          )
          setLoading(false)
        }}>
        <input
          type={showPassword?"text":"password"}
          name="password"
          className="text-input"
          placeholder="Set Password..."
          onChange={e => setPassword(e.target.value)}
          value={password}
          required />
        <input
          type={showPassword?"text":"password"}
          name="confirm"
          className="text-input"
          placeholder="Confirm Password..."
          onChange={e => setConfirm(e.target.value)}
          value={confirm}
          required />
          <label className="mb-2">
            <input
              type="checkbox"
              className="checkbox-input"
              onChange={() => {
                setShow(!showPassword)
              }}/>
            Show password
          </label>
        <input
          type="submit"
          className="submit-input"
          value="Save"
        />
      </form>
    </main>
  )
}
export default Password