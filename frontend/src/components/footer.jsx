import { static_dir } from "../config"

function Footer(){
  return (
    <footer id="contact">
 
      <div className="lists">
        <div className="listBox">
          <img src={static_dir+"images/logo-white.png"} alt="" />
          <div className="text-justify">
            <div className="social">
              <img src={static_dir+"images/icons/facebook.svg"} />
              <img src={static_dir+"images/icons/instagram.svg"} />
              <img src={static_dir+"images/icons/linkedin.svg"} />
              <img src={static_dir+"images/icons/twiter.svg"} />
              <img src={static_dir+"images/icons/whatsapp.svg"} />
            </div>
          </div>
        </div>
        <div className="listBox">
          <h3>Group Members</h3>
          <ul>
            <li>Moeez Raza</li>
            <li>Muneeba Munir</li>
            <li>Maham Maqsood</li>
            <li>Taqadus Noor</li>
          </ul>
        </div>
        <div className="listBox">
          <h3>Experties</h3>
          <ul>
            <li>Backend</li>
            <li>Frontend</li>
            <li>Debugging</li>
            <li>Documentation</li>
          </ul>
        </div>
        <div className="listBox">
          <h3>Campuses</h3>
          <ul>
            <li>Gulberg III, Lahore</li>
            <li>Raiwand road, Lahore</li>
            <li>Thokar Niaz Baig, Lahore</li>
            <li>Township, Lahore</li>
          </ul>
        </div>
      </div>
      <p>© 2026 Riphah International University. All rights reserved.</p>
    </footer>
  )
}
export default Footer