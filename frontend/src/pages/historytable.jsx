import { useState } from "react"
import { getHistory } from "../utils/history"
import { static_dir } from "../config"
import Table from "../components/table"

function HistoryTable(){
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async (session_id, navigate=null) => {
    const data = await getHistory(
      session_id,
      () => {},
      null,
      navigate
    )
    return data
  }
  return (
    <Table
      cols={["ID", "Package", "Amount", "Date", "Time"]}
      model="history"
      inputs={[]}
      addRow={null}
      updateRow={null}
      fetchData={loadData}
      renderRows={(rows, user, permissions, setMode, setData, setDialog) => {return rows.filter((hisotry) => {
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
      ))}}>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Admin">Package</option>
        </select>
      </div>
    </Table>
  )
}
export default HistoryTable