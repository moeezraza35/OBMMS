import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import makeRequest from "../utils/request"
import redirect from "../utils/redirect"

function Login(){
  const [sap, setSap] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShow] = useState(false)
  const { user, require_auth } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)
  const navigate = useNavigate()
  useEffect(() => {
    redirect(user, navigate, "/login/")
  }, [user])
  return (
    <main className="pt-28">
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          await makeRequest(
            "auth/login/",
            "POST",
            "",
            {
              "sap": sap,
              "password": password
            },
            async (data) => await require_auth(data.session_id),
            async (res) => alert(res.detail)
          )
          setLoading(false)
        }}>
        <label>
          <input
            type="text"
            placeholder="SAP ID..."
            className="text-input"
            value={sap}
            onChange={(e) => {
              if (!isNaN(Number(e.target.value))){
                setSap(e.target.value)
              }
            }}
            required
          />
        </label>
        <label>
          <input
            type={showPassword?"text":"password"}
            placeholder="Password..."
            className="text-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            required
          />
        </label>
        <label className="mb-2">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={showPassword}
            onChange={() => {
              setShow(!showPassword);
            }}
          />
          Show Password
        </label>
        <input
          type="submit"
          value="Login"
          className="submit-input"
        />
      </form>
    </main>
  )
}
export default Login