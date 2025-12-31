import { useContext, useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { api_prefix, backend, frontend, static_dir } from "../config";
import { AuthContext } from "../context/auth";
import { LoadingContext } from "../context/loading";

function Header(){
  const [nav, setNav] = useState("");
  const [profmenu, setProfmenu] = useState("");
  const { user, loginCheck } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)
  const location = useLocation()
  useEffect(() => {
    setProfmenu("")
    setNav("")
  }, [location])
  return (
    <header>
      <div className="brand">
        <img src="/images/riphah-title.png" alt="" />
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
            <li><a onClick={() => {
              setLoading(true)
              fetch(backend+api_prefix+"auth/logout/", {
                method: "GET",
                credentials: "include",
                headers: {
                  "Content-Type" : "application/json"
                }
              })
              .then(() => {
                loginCheck()
                setLoading(false)
              })
              .catch((e) => console.log("Unable to logout", e))
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