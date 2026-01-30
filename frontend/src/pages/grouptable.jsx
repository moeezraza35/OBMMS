import { useState } from "react"
import { addGroup, getGroups, updateGroup } from "../utils/group"
import Table from "../components/table"

function GroupTable({ models }){
  const [search, setSearch] = useState("")
  const loadData = async (session_id, navigate) => {
    return await getGroups(session_id, ()=>{}, null, navigate)
  }
  return (
    <Table
      cols={["ID", "Name"]}
      model="group"
      inputs={[
        {type: "text", name: "name", placeholder: "Group Name...", required: true},
        ...models.map(model => (
          {type: "select", name: model, placeholder: model, values: [
            {value: "", label: "Not Allowed"},
            {value: "r", label: "Read Only"},
            {value: "w", label: "Read & Write"},
          ]}
        ))
      ]}
      addRow={addGroup}
      updateRow={updateGroup}
      fetchData={loadData}
      renderRows={(rows, user, permissions, setMode, setData, setDialog) => {
        return rows.filter((group) => {
          const matchSearch = search === "" || group.name.toLowerCase().includes(search.toLowerCase()) || String(group.id).includes(search)
          return matchSearch
        }).map(group => (
          <tr key={group.id}>
            <td>{group.id}</td>
            <td>{group.name}</td>
            {user?.is_admin || permissions.group==='w'?<td><button onClick={() => {
              setMode(group.id)
              var p = JSON.parse(group.permissions.replace(/'/g, '"'))
              setData({
                "id": group.id,
                "name": group.name,
                ...p
              })
              setDialog(true)
            }}>Edit</button></td>:""}
          </tr>
        ))}}>
      <div className="p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
    </Table>
  )
}
export default GroupTable