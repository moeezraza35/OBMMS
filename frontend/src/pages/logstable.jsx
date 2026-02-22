import { useEffect, useState } from "react"
import { getLogs, deleteLogs } from "../utils/logs"
import { static_dir } from "../config"
import Table from "../components/table"

function LogsTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [search, setSearch] = useState("")
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    getLogs(session_id, setRows, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      <Table
        cols={["ID", user?.is_admin ? ["User"] : [], "Model", "Action", "Row", "Date", "Time", "-"]}
        renderRows={() => {
          return rows.filter((log) => {
            return String(log.id).includes(search) ||
              String(log.user).includes(search.toLowerCase()) ||
              log.model.toLowerCase().includes(search.toLowerCase())
          }).map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              {user?.is_admin && <td>{row.user}</td>}
              <td>{row.model}</td>
              <td>{row.action}</td>
              <td>{row.row}</td>
              <td>{row.date}</td>
              <td>{row.time}</td>
              <td>{user?.is_admin?
                <button className="del-btn" onClick={() => deleteLogs({id: row.id}, session_id, () => {
                  setRows(rows.filter(r => r.id !== row.id))
                }, null, navigate)}><img src={static_dir+"images/icons/delete.svg"} /></button>
              :'-'}</td>
            </tr>
          ))}
        }/>
    </>
  )
}
export default LogsTable