import { static_dir } from "../config"
import { ListBox_Content } from "./content"

function Footer(){
  return (
    <footer id="contact">
      <img src={static_dir+"images/riphah-logo.jpg"} />
      <div className="lists">
        <ListBox_Content title={"Group Member"}>
          <ul>
            <li>Moeez Raza</li>
            <li>Muneeba Munir</li>
            <li>Maham Maqsood</li>
            <li>Taqadus Noor</li>
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
        <ListBox_Content title={"Contact"}>
          <ul>
            <li>+92 3** *******</li>
            <li>+92 3** *******</li>
            <li>+92 3** *******</li>
            <li>+92 3** *******</li>
          </ul>
        </ListBox_Content>
      </div>
      <div className="social">
        <img src={static_dir+"images/icons/facebook.svg"} />
        <img src={static_dir+"images/icons/instagram.svg"} />
        <img src={static_dir+"images/icons/linkedin.svg"} />
        <img src={static_dir+"images/icons/twiter.svg"} />
        <img src={static_dir+"images/icons/whatsapp.svg"} />
      </div>
    </footer>
  )
}
export default Footer