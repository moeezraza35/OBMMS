import { useState } from "react"
import { getLogs } from "../utils/logs"
import { getUsers } from "../utils/users"
import { static_dir } from "../config"
import Table from "../components/table"

function LogsTable(){
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async (session_id, navigate=null) => {
    const data = await getLogs(
      session_id,
      () => {},
      null,
      navigate
    )
    return data
  }
  return (
    <Table
      cols={["ID", "Model", "Action", "Row", "Date", "Time"]}
      model="logs"
      inputs={[]}
      addRow={null}
      updateRow={null}
      fetchData={loadData}
      renderRows={(rows, user, permissions, setMode, setData, setDialog) => {return rows.filter((user) => {
        return true
      }).map(row => (
        <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.model}</td>
          <td>{row.action}</td>
          <td>{row.row}</td>
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
          <option value="Admin">Admin</option>
        </select>
      </div>
    </Table>
  )
}
export default LogsTable