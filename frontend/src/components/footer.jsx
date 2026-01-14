import { static_dir } from "../config"
import { ListBox_Content } from "./content"

function Footer(){
  return (
    <footer id="contact">
 
      <div className="lists">
        <div className="listBox">
          <img src={static_dir+"images/riphah-title-white.png"} alt="" />
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
        <ListBox_Content title={"Group Member"}>
          <ul>
            <li>Moeez Raza</li>
            <li>Muneeba Munir</li>
            <li>Maham Maqsood</li>
            <li>Taqadus Noor</li>
          </ul>
        </ListBox_Content>
        <ListBox_Content title={"Experties"}>
          <ul>
            <li>Backend</li>
            <li>Frontend</li>
            <li>Debugging</li>
            <li>Documentation</li>
          </ul>
        </ListBox_Content>
        <ListBox_Content title={"Campuses"}>
          <ul>
            <li>Gulberg III, Lahore</li>
            <li>Raiwand road, Lahore</li>
            <li>Thokar Niaz Baig, Lahore</li>
            <li>Township, Lahore</li>
          </ul>
        </ListBox_Content>
      </div>
      <p>© 2026 Riphah International University. All rights reserved.</p>
    </footer>
  )
}
export default Footer