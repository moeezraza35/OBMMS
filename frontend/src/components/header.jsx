import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { frontend, static_dir } from "../config";
import { AuthContext } from "../context/auth";
import { LoadingContext } from "../context/loading";
import makeRequest from "../utils/request";

function Header(){
  const [nav, setNav] = useState("");
  const [profmenu, setProfmenu] = useState("");
  const { user, session_id, require_auth } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    setProfmenu("")
    setNav("")
  }, [location])
  return (
    <header>
      <div className="brand">
        <img src="/images/logo.png" alt="" />
      </div>
      <div className="toggle">
        <button onClick={() => {
          if (nav == ""){
            if (profmenu == "active"){
              setProfmenu("")
            }
            setNav("active");
          } else {
            setNav("");
          }
        }}>
          <img src="/images/icons/menu.svg" alt="" />
        </button>
      </div>
      <nav className={nav}>
        <ul>
          <li><Link to={frontend+"/"}>Home</Link></li>
          <li><Link to={frontend+"/#aboutus"}>About Us</Link></li>
          <li><Link to={frontend+"/#objectives"}>Objectives</Link></li>
          <li><Link to={frontend+"/#ourwork"}>Our Work</Link></li>
          <li><Link to="#contact">Contact</Link></li>
        </ul>
      </nav>
      <div className="profile">
        <button onClick={() => {
          if (profmenu == ""){
            if (nav == "active"){
              setNav("")
            }
            setProfmenu("active")
          } else {
            setProfmenu("")
          }
        }}>
          <img src={static_dir+(user == null?"images/icons/login.svg":"images/icons/profile.svg")} />
        </button>
        <menu className={profmenu}>
          {user != null?
          <ul>
            <li><Link to={frontend+"/profile/"}>Profile</Link></li>
            <li><Link to={frontend+"/dashboard/"}>Dashboard</Link></li>
            <li><a onClick={async () => {
              setLoading(true)
              await makeRequest(
                "auth/logout/",
                "GET",
                session_id,
                null,
                async (data) => await require_auth(data.session_id),
                null,
                navigate
              )
              navigate("/login/")
              setLoading(false)
            }}>Logout</a></li>
          </ul>:
          <ul>
            <li><Link to={frontend+"/login/"}>Login</Link></li>
          </ul>}
        </menu>
      </div>
    </header>
  )
}
export default Header