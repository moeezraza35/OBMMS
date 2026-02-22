import { useEffect, useState } from "react"
import { getRoutes, addRoute, updateRoute, deleteRoute } from "../utils/routes"
import { getActiveStops } from "../utils/stops"
import { getBusesName } from "../utils/buses"
import { static_dir } from "../config"
import Table from "../components/table"
import Dialog from "../components/dialog"

function RoutesTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [stops, setStops] = useState([])
  const [buses, setBuses] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const dialogProp = { dialog, formMode, formData, addRow: addRoute, updateRow: updateRoute, setData, setDialog, setRows }
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getRoutes(session_id, setRows, null, navigate)
    await getActiveStops(session_id, setStops, null, navigate)
    await getBusesName(session_id, setBuses, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
        inputs={[
          {type: "select", name: "departure", required: true, values: [
            {value: "", label: "--Not-Selected--"},
            ...stops.map(stop => ({value: stop.id,label: stop.name}))
          ]},
          {type: "select", name: "destination", required: true, values: [
            {value: "", label: "--Not-Selected--"},
            ...stops.map(stop => ({value: stop.id,label: stop.name}))
          ]},
          {type: "select", name: "bus", required: true, values: [
            {value: "", label: "--Not-Selected--"},
            ...buses.map(bus => ({value: bus.id,label: bus.license}))
          ]},
          {type: "time", name: "time", required: true, placeholder: "HH:MM"},
          {type: "checkbox", name: "active", placeholder:""}
        ]}
        {...dialogProp}>Route</Dialog>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="text-input">
          <option value="All" defaultChecked>All</option>
          {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.license}</option>)}
        </select>
      </div>
      <Table
        cols={["ID", "Departure", "Destination", "Bus", "Time", "Active"]}
        permission={user?.is_admin || permissions.routes == 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
          return rows.filter((route) => {
            const departure = stops.find(stop => stop.id === route.departure)?.name || ""
            const destination = stops.find(stop => stop.id === route.destination)?.name || ""
            const matchSearch = search === "" || departure.toLowerCase().includes(search.toLowerCase()) || destination.toLowerCase().includes(search.toLowerCase())
            const matchSelect = select === "All" || (select === "Active" && route.active) || (select === "Inactive" && !route.active)
            return matchSearch && matchSelect
          }).map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{stops.find(stop => stop.id === row.departure)?.name}</td>
              <td>{stops.find(stop => stop.id === row.destination)?.name}</td>
              <td>{buses.find(bus => bus.id === row.bus)?.license}</td>
              <td>{row.time}</td>
              <td>{row.active?'🟢':'🔴'}</td>
              {user?.is_admin || permissions.routes==='w'?<td>
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
                <button onClick={() => deleteRoute({id: row.id}, session_id, () => {
                  setRows(prev => prev.filter(r => r.id !== row.id))
                }, null, navigate)} className="del-btn"><img src={static_dir+"images/icons/delete.svg"} /></button>
              </td>:""}
            </tr>
          ))}}/>
    </>
  )
}
export default RoutesTable