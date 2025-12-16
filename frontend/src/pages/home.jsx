import { useState } from "react"
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
        }}><img src="/images/icons/arrow.svg"/></button>
        <button className="right-btn" onClick={() => {
          if (img == 2){
            setImg(0)
          } else {
            setImg(img+1)
          }
        }}><img src="/images/icons/arrow.svg"/></button>
        <img src="/images/banner-1.jpg" className={img==0?"active":""} />
        <img src="/images/banner-2.jpg" className={img==1?"active":""}/>
        <img src="/images/banner-3.jpg" className={img==2?"active":""}/>
      </div>
      <Two_Sided_Content title={"About Us"} imgsrc={"/images/image.jpg"} id="aboutus">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia quasi voluptatum nesciunt molestias quod. Placeat, qui. Sit magnam fuga minima reprehenderit. Eius magnam quaerat dolorum, fugit eum tempora commodi expedita.
      </Two_Sided_Content>
      <section className="p-3" id="objectives">
        <h1 className="text-center my-3">
          Objectives
        </h1>
        <div className="flex justify-center gap-1 flex-wrap">
          <Card_Content img="/images/image.jpg">
            <h3>Online Monitoring</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut beatae voluptatibus earum natus, eum dolorem mollitia. Esse, veritatis at possimus nam qui perferendis doloremque harum, quidem voluptates pariatur eius error?
            </p>
          </Card_Content>
          <Card_Content img="/images/image.jpg">
            <h3>Manage Dues</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut beatae voluptatibus earum natus, eum dolorem mollitia. Esse, veritatis at possimus nam qui perferendis doloremque harum, quidem voluptates pariatur eius error?
            </p>
          </Card_Content>
          <Card_Content img="/images/image.jpg">
            <h3>Students Safety</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut beatae voluptatibus earum natus, eum dolorem mollitia. Esse, veritatis at possimus nam qui perferendis doloremque harum, quidem voluptates pariatur eius error?
            </p>
          </Card_Content>
          <Card_Content img="/images/image.jpg">
            <h3>Any other</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut beatae voluptatibus earum natus, eum dolorem mollitia. Esse, veritatis at possimus nam qui perferendis doloremque harum, quidem voluptates pariatur eius error?
            </p>
          </Card_Content>
        </div>
      </section>
      <Two_Sided_Content title={"Our Work"} reverse={true} imgsrc={"/images/image.jpg"} id={"ourwork"}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia quasi voluptatum nesciunt molestias quod. Placeat, qui. Sit magnam fuga minima reprehenderit. Eius magnam quaerat dolorum, fugit eum tempora commodi expedita.
      </Two_Sided_Content>
    </main>
  )
}
export default Home