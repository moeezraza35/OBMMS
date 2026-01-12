import { useState } from "react"
import { static_dir } from "../config"
import { Card_Content, Two_Sided_Content } from "../components/content"

function Home(){
  const [img, setImg] = useState(0)
  return (
    <main className="home">
      <div className="slider">
        <button className="left-btn" onClick={() => {
          if (img == 0){
            setImg(2)
          } else {
            setImg(img-1)
          }
        }}><img src={static_dir+"images/icons/arrow.svg"}/></button>
        <button className="right-btn" onClick={() => {
          if (img == 2){
            setImg(0)
          } else {
            setImg(img+1)
          }
        }}><img src={static_dir+"images/icons/arrow.svg"}/></button>
        <img src={static_dir+"images/banner-1.jpg"} className={img==0?"active":""} />
        <img src={static_dir+"images/banner-2.jpg"} className={img==1?"active":""}/>
        <img src={static_dir+"images/banner-3.jpg"} className={img==2?"active":""}/>
      </div>
      <Two_Sided_Content title={"About Us"} imgsrc={static_dir+"images/about.jpg"} id="aboutus">
        We created the Online Bus Management and Monitoring System to make transportation safer, smarter, and more efficient. Our platform allows real-time bus tracking, online fee management, and instant notifications for students, parents, and administrators. The system improves communication, reduces delays, and ensures a secure travel experience for everyone.
      </Two_Sided_Content>
      <section className="p-3" id="objectives">
        <h1 className="text-center my-3">
          Objectives
        </h1>
        <div className="flex justify-center gap-1 flex-wrap">
          <Card_Content img={static_dir+"images/location.png"}>
            <h3>Online Monitoring</h3>
            <p>
              This feature allows real-time tracking of buses using GPS and internet technology. Admins and users can view the exact location, route, and movement of each bus through a web or mobile application.
            </p>
          </Card_Content>
          <Card_Content img={static_dir+"images/payment.png"}>
            <h3>Manage Dues</h3>
            <p>
              The manage dues module helps students and parents pay bus fees online easily. It records all payments, generates receipts, and reduces the need for manual cash handling.
            </p>
          </Card_Content>
          <Card_Content img={static_dir+"images/safety.jpg"}>
            <h3>Students Safety</h3>
            <p>
              This system ensures student safety by monitoring bus routes, speed, and stops. Parents and school authorities can track the bus to make sure students travel securely.
            </p>
          </Card_Content>
          <Card_Content img={static_dir+"images/Alert.png"}>
            <h3>Notification & Alert System</h3>
            <p>
              The notification system sends instant updates about bus delays, arrivals, and emergencies. Users receive alerts on their phones to stay informed in real time.
            </p>
          </Card_Content>
        </div>
      </section>
      <Two_Sided_Content title={"Our Work"} reverse={true} imgsrc={static_dir+"images/work.jpeg"} id={"ourwork"}>
        This project focuses on building a smart and reliable Online Bus Management and Monitoring System. It integrates GPS tracking, online payments, and real-time notifications to improve transportation efficiency and student safety.
      </Two_Sided_Content>
    </main>
  )
}
export default Home