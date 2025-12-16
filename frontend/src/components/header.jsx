import { useState } from "react"
import { Link } from "react-router-dom"

function Header(){
  const [nav, setNav] = useState("");
  const [profmenu, setProfmenu] = useState("");
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/#aboutus">About Us</Link></li>
          <li><Link to="/#objectives">Objectives</Link></li>
          <li><Link to="/#ourwork">Our Work</Link></li>
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
          <img src="/images/icons/profile.svg" alt="" />
        </button>
        <menu className={profmenu}>
          <ul>
            <li><Link to="/profile/">Profile</Link></li>
            <li><Link to="/dashboard/">Dashboard</Link></li>
            <li><Link to="/login/">Logout</Link></li>
          </ul>
        </menu>
      </div>
    </header>
  )
}
export default Header