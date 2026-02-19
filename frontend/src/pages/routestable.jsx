import { useState } from "react"
import { getRoutes, addRoute, updateRoute } from "../utils/routes"
import { static_dir } from "../config"
import Table from "../components/table"

function RoutesTable(){
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async (session_id, navigate=null) => {
    const data = await getRoutes(
      session_id,
      () => {},
      null,
      navigate
    )
    return data
  }
  return (
    <Table
      cols={["ID", "Departure", "Destination", "Bus", "Time", "Active"]}
      model="routes"
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
      addRow={addRoute}
      updateRow={updateRoute}
      fetchData={loadData}
      renderRows={(rows, user, permissions, setMode, setData, setDialog) => {return rows.filter((route) => {
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
      ))}}>
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
    </Table>
  )
}
export default RoutesTable