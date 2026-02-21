import { useEffect, useState } from "react"
import { getHistory } from "../utils/history"
import { static_dir } from "../config"
import Table from "../components/table"

function HistoryTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getHistory(session_id, setRows, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Admin">Package</option>
        </select>
      </div>
      <Table
        cols={["ID", "Package", "Amount", "Date", "Time"]}
        permission={false}
        setMode={null}
        setDialog={null}
        renderRows={() => {
          return rows.filter((hisotry) => {
            return true
          }).map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.package}</td>
              <td>{row.amount}</td>
              <td>{row.date}</td>
              <td>{row.time}</td>
              <td>
                <button className="del-btn"><img src={static_dir+"images/icons/delete.svg"} /></button>
              </td>
            </tr>
          ))}}/>
    </>
  )
}
export default HistoryTable