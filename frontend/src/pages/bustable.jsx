import { useEffect, useState } from "react"
import { addBus, getBuses, updateBus } from "../utils/buses"
import { static_dir } from "../config"
import Table from "../components/table"
import Dialog from "../components/dialog"

function BusTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const dialogProp = { dialog, formMode, formData, addBus, updateBus, setData, setDialog, setRows }
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getBuses(session_id, setRows, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
        inputs={[
          {type: "text", name: "license", required: true},
          {type: "number", name: "capacity", required: true}
        ]}
        {...dialogProp}/>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Active">Active</option>
          <option value="Not Active">Not Active</option>
        </select>
      </div>
      <Table
        cols={["ID", "License No.", "Capacity", "Passengers", "Active"]}
        permission={user?.is_admin || permissions.buses == 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
          return rows.filter((bus) => {
            const matchSearch = search === "" || bus.License.toLowerCase().includes(search.toLowerCase()) || String(bus.id).includes(search)
            const matchSelect = select === "All" || select === "active" && bus.active
            return matchSearch && matchSelect
          }).map((bus) => (
            <tr key={bus.id}>
              <td>{bus.id}</td>
              <td>{bus.license}</td>
              <td>{bus.capacity}</td>
              <td>{bus.passengers}</td>
              <td>{bus.active?'🟢':'🔴'}</td>
              {user?.is_admin || permissions.buses === 'w'?<td>
                <button className="edit-btn" onClick={() => {
                  setData({
                    "id": bus.id,
                    "license": bus.license,
                    "capacity": bus.capacity
                  })
                  setMode(bus.id)
                  setDialog(true)
                }}><img src={static_dir+"images/icons/edit.svg"}/></button>
                <button className="del-btn"><img src={static_dir+"images/icons/delete.svg"} /></button>
              </td>:""}
            </tr>
          ))
        }}/>
    </>
  )
}
export default BusTable