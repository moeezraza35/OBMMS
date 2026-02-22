import { useEffect, useState } from "react"
import { getUsersName } from "../utils/users"
import { getPackages, addPackages, updatePackages, deletePackages } from "../utils/packages"
import { static_dir } from "../config"
import Table from "../components/table"
import Dialog from "../components/dialog"

function PackagesTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const dialogProp = { dialog, formMode, formData, addRow: addPackages, updateRow: updatePackages, setData, setDialog, setRows }
  const loadData = async () => {
    setRows([])
    setLoading(true)
    await getPackages(session_id, setRows, null, navigate)
    await getUsersName(session_id, setUsers, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
        inputs={[
          {type: "select", name: "user", values: [
            {value: "", label: "--Not-Selected--"},
            ...users.map(u => ({value: u.id, label: u.name}))
          ]},
          {type: "number", name: "price", placeholder: "Price...", required: true},
          {type: "number", name: "amount", placeholder: "Add Amount..."},
          {type: "number", name: "installments"},
          {type: "date", name: "start", required: true},
          {type: "date", name: "end", required: true},
          {type: "checkbox", name: "active", placeholder:""}
        ]}
        {...dialogProp}>Package</Dialog>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      <Table
        cols={["ID", "User", "Price", "Amount", "Installments", "Start", "End", "Active"]}
        permission={user?.is_admin || permissions.packages === 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
          return rows.filter((packages) => {
            return packages.id.toString().includes(search) ||
            packages.user.toString().includes(search) ||
            users.find(u => u.id == packages.user)?.name.toLowerCase().includes(search.toLowerCase())
          }).map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{users.find(u => u.id == row.user)?.name || "Unknown User"}</td>
              <td>Rs. {row.price}</td>
              <td>Rs. {row.amount}</td>
              <td>{row.installments}</td>
              <td>{row.start}</td>
              <td>{row.end}</td>
              <td>{row.active?'🟢':'🔴'}</td>
              {user?.is_admin || permissions.users==='w'?<td>
                <button className="edit-btn" onClick={() => {
                  setMode(row.id)
                  setData({
                    id: row.id,
                    user: row.user,
                    price: row.price,
                    installments: row.installments,
                    start: row.start,
                    end: row.end,
                    active: row.active
                  })
                  setDialog(true)
                }}><img src={static_dir+"images/icons/edit.svg"}/></button>
            <button onClick={() => deletePackages({id: row.id}, session_id, () => {
              setRows(prev => prev.filter(r => r.id !== row.id))
            }, null, navigate)} className="del-btn"><img src={static_dir+"images/icons/delete.svg"} /></button>
          </td>:""}
        </tr>
      ))}}/>
    </>
  )
}
export default PackagesTable