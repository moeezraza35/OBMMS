import { useEffect, useState } from "react"
import { getGroups } from "../utils/group"
import { addUser, getUsers, updateUser } from "../utils/users"
import { static_dir } from "../config"
import Table from "../components/table"
import Dialog from "../components/dialog"

function UsersTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getUsers(session_id, setRows, null, navigate)
    await getGroups(session_id, data => setGroups(data), null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
        dialog={dialog}
        formMode={formMode}
        inputs={[
          {type: "text", name: "name", placeholder: "Full Name...", required: true},
          {type: "password", name: "password", placeholder: ""},
          {type: "checkbox", name: "active", placeholder:""},
          {type: "select", name: "group", values: [
            {value: "", label: "--Not-Selected--"},
            {value: "Admin"},
            ...groups.map(group => ({value: group.id,label: group.name}))
          ]}
        ]}
        formData={formData}
        addRow={addUser}
        updateRow={updateUser}
        setData={setData}
        setDialog={setDialog}
        setRows={setRows}/>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Admin">Admin</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>
      <Table
        cols={["ID", "Name", "Group", "Active"]}
        permission={user?.is_admin || permissions?.user === 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
          return rows.filter((user) => {
            const matchSearch = search === "" || user.name.toLowerCase().includes(search.toLowerCase()) || String(user.id).includes(search)
            const matchSelect = select === "All" || (select === "Admin" && user.is_admin) || (select == user.group)
            return matchSearch && matchSelect
          }).map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.is_admin?"Admin":(groups.find(group => group.id == row.group)?.name ?? "")}</td>
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
export default UsersTable