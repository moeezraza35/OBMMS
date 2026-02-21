import { useEffect, useState } from "react"
import { getRoutes, addRoute, updateRoute } from "../utils/routes"
import { static_dir } from "../config"
import Table from "../components/table"
import Dialog from "../components/dialog"

function RoutesTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getRoutes(session_id, setRows, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
        dialog={dialog}
        formMode={formMode}
        inputs={[
          {type: "select", name: "departure", required: true, values: [
            {value: "", label: "--Not-Selected--"},
            // ...groups.map(group => ({value: group.id,label: group.name}))
          ]},
          {type: "select", name: "destination", required: true, values: [
            {value: "", label: "--Not-Selected--"},
            // ...groups.map(group => ({value: group.id,label: group.name}))
          ]},
          {type: "select", name: "bus", required: true, values: [
            {value: "", label: "--Not-Selected--"},
            // ...groups.map(group => ({value: group.id,label: group.name}))
          ]},
          {type: "time", name: "time", required: true, placeholder: "HH:MM"},
          {type: "checkbox", name: "active", placeholder:""}
        ]}
        formData={formData}
        addRow={addRoute}
        updateRow={updateRoute}
        setData={setData}
        setDialog={setDialog}
        setRows={setRows}/>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="text-input">
          <option value="All" defaultChecked>All</option>
          <option value="Bus 1">Bus 1</option>
          <option value="Bus 2">Bus 2</option>
        </select>
      </div>
      <Table
        cols={["ID", "Departure", "Destination", "Bus", "Time", "Active"]}
        permission={user?.is_admin || permissions.routes == 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
          return rows.filter((route) => {
            const matchSearch = search === "" || route.departure.toLowerCase().includes(search.toLowerCase()) || route.destination.includes(search.toLowerCase())
            const matchSelect = select === "All" || (select === "Active" && route.active) || (select === "Inactive" && !route.active)
            return matchSearch && matchSelect
          }).map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.departure}</td>
              <td>{row.destination}</td>
              <td>{row.bus}</td>
              <td>{row.time}</td>
              {/* <td>{row.is_admin?"Admin":(groups.find(group => group.id == row.group)?.name ?? "")}</td> */}
              <td>{row.active?'🟢':'🔴'}</td>
              {user?.is_admin || permissions.users==='w'?<td>
                <button className="edit-btn" onClick={() => {
                  setMode(row.id)
                  setData({
                    "id": row.id,
                    "departure": row.departure,
                    "destination": row.destination,
                    "bus": row.bus,
                    "time": row.time,
                    "active": row.active
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
export default RoutesTable