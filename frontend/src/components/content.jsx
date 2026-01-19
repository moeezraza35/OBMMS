function Two_Sided_Content({ imgsrc, title, reverse=false, id, children }){
  return (
    <section className={(reverse?"reverse ":"")+"two-sided-content"} id={id}>
      <div className="p-3">
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      <div>
        <img src={imgsrc} alt="" />
      </div>
    </section>
  )
}
function Card_Content({img, children}){
  return (
    <div className="card card-vertical">
      <img src={img} alt="" />
      <div className="p-3">
        {children}
      </div>
    </div>
  )
}
function Horizontal_Card_Content({children}){
  return (
    <div className="card card-horizontal">
      {children}
    </div>
  )
}
export {Two_Sided_Content, Card_Content, Horizontal_Card_Content}