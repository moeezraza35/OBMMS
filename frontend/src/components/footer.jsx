import { ListBox_Content } from "./content"

function Footer(){
  return (
    <footer id="contact">
      <img src="/images/riphah-logo.jpg" />
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
        <img src="/images/icons/facebook.svg" />
        <img src="/images/icons/instagram.svg" />
        <img src="/images/icons/linkedin.svg" />
        <img src="/images/icons/twiter.svg" />
        <img src="/images/icons/whatsapp.svg" />
      </div>
    </footer>
  )
}
export default Footer