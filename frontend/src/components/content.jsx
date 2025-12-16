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
    <div className="card">
      <img src={img} alt="" />
      <div className="p-3">
        {children}
      </div>
    </div>
  )
}
function ListBox_Content({title, children}){
  return (
    <div className="listBox">
      <h3>{title}</h3>
      <div>
        {children}
      </div>
    </div>
  )
}
export {Two_Sided_Content, Card_Content, ListBox_Content}