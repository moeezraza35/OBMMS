import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api_prefix, backend } from "../config"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"

function Login(){
  const [sap, setSap] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShow] = useState(false)
  const { loginCheck } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)
  const navigate = useNavigate()
  return (
    <main className="pt-28">
      <form
        className="w-full max-w-sm border border-(--highlight-color) mx-auto shadow-lg p-10 rounded"
        onSubmit={(e) => {
          e.preventDefault()
          setLoading(true)
          fetch(backend+api_prefix+"auth/login/", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "sap":sap,
              "password":password
            })
          })
          .then(async (res) => {
            let data = null
            try { data = await res.json() } catch (err) { data = null }
            if (!res.ok) {
              let msg = data && data.detail ? data.detail : null
              alert(msg)
              setLoading(false)
            }
            else if (data && data.session_id) {
              await loginCheck()
              navigate("/dashboard/")
            } else {
              alert("Login failed. Please try again.")
            }
            setLoading(false)
          })
          .catch((e) => {
            setLoading(false)
            alert("Network error. Please check your connection.")
            console.log("Unable to fetch data", e)
          })
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
            className="mr-2 align-baseline"
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