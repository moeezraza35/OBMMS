import { useState } from "react"
import { getGroups, updateGroup } from "../utils/group"
import { addUser, getUsers, updateUser } from "../utils/users"
import Table from "../components/table"
import { static_dir } from "../config"

function UsersTable(){
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async (session_id, navigate=null) => {
    const data = await getUsers(
      session_id,
      () => {},
      null,
      navigate
    )
    await getGroups(
      session_id,
      data => setGroups(data),
      null,
      navigate
    )
    return data
  }
  return (
    <Table
      cols={["ID", "Name", "Group", "Active"]}
      model="users"
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
      addRow={addUser}
      updateRow={updateUser}
      fetchData={loadData}
      renderRows={(rows, user, permissions, setMode, setData, setDialog) => {return rows.filter((user) => {
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
      ))}}>
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
    </Table>
  )
}
export default UsersTable