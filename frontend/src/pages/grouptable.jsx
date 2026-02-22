import { useEffect, useState } from "react"
import { addGroup, getGroups, updateGroup, deleteGroup } from "../utils/group"
import { static_dir } from "../config"
import Dialog from "../components/dialog"
import Table from "../components/table"

function GroupTable({models=[], session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [search, setSearch] = useState("")
  const dialogProp = { dialog, formMode, formData, addRow: addGroup, updateRow: updateGroup, setData, setDialog, setRows }
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getGroups(session_id, setRows, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
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
        {...dialogProp}>Group</Dialog>
      <div className="p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      <Table
        cols={["ID", "Name"]}
        permission={user?.is_admin || permissions.group == 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
        return rows.filter((group) => {
          const matchSearch = search === "" || group.name.toLowerCase().includes(search.toLowerCase()) || String(group.id).includes(search)
          return matchSearch
        }).map(group => (
          <tr key={group.id}>
            <td>{group.id}</td>
            <td>{group.name}</td>
            {user?.is_admin || permissions.group==='w'?<td>
              <button className="edit-btn" onClick={() => {
                setMode(group.id)
                var p = JSON.parse(group.permissions.replace(/'/g, '"'))
                setData({
                  "id": group.id,
                  "name": group.name,
                  ...p
                })
                setDialog(true)
              }}><img src={static_dir+"images/icons/edit.svg"}/></button>
              <button className="del-btn" onClick={() => {deleteGroup({id: group.id}, session_id, () => {
                setRows(prev => prev.filter(r => r.id !== group.id))
              }, null, navigate)
              }}><img src={static_dir+"images/icons/delete.svg"} /></button>
            </td>:""}
          </tr>
        ))}}/>
    </>
  )
}
export default GroupTable