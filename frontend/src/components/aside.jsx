import { useState } from "react"

function Aside({ title, children }){
  const [showAside, setAside] = useState(false)
  return (
    <aside className={showAside?"active":""}>
      <div>
        <h3 className="mb-2">{title}</h3>
        <ul>
          { children }
        </ul>
      </div>
      <button className={showAside?"left-btn":"right-btn"} onClick={() => {
        setAside(!showAside)
      }}>
        <img src="/images/icons/arrow.svg" alt="" />
      </button>
    </aside>
  )
}
export default Aside