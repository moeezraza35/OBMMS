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
  const loadData = async () => {
    setLoading(true)
    await getPackages(session_id, setRows, null, navigate)
    await getUsersName(session_id, setUsers, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
      dialog={dialog}
        formMode={formMode}
        inputs={[
          {type: "select", name: "user", values: [{value: "", label: "--Not-Selected--"}]},
          {type: "number", name: "price", placeholder: "Price...", required: true},
          {type: "number", name: "amount", placeholder: "Add Amount..."},
          {type: "number", name: "Installments"},
          {type: "date", name: "Start Date", required: true},
          {type: "date", name: "End Date", required: true},
          {type: "checkbox", name: "active", placeholder:""}
        ]}
        formData={formData}
        addRow={addPackages}
        updateRow={updatePackages}
        setData={setData}
        setDialog={setDialog}
        setRows={setRows}/>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="">User 1</option>
        </select>
      </div>
      <Table
        cols={["ID", "User", "Price", "Amount", "Installments", "Start", "End", "Active"]}
        permission={user?.is_admin || permissions.packages === 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
          return rows.filter((packages) => {
            // const matchSearch = search === "" || user.name.toLowerCase().includes(search.toLowerCase()) || String(user.id).includes(search)
            // const matchSelect = select === "All" || (select === "Admin" && user.is_admin) || (select == user.group)
            return true
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
                    "id": row.id,
                    "name": row.name,
                    "password": "",
                    "active": row.active,
                    "group": row.is_admin ? "Admin" : String(row.group)
                  })
                  setDialog(true)
                }}><img src={static_dir+"images/icons/edit.svg"}/></button>
            <button className="del-btn"><img src={static_dir+"images/icons/delete.svg"} /></button>
          </td>:""}
        </tr>
      ))}}/>
    </>
  )
}
export default PackagesTable