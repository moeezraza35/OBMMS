import { useState } from "react"
import { addBus, getBuses, updateBus } from "../utils/buses"
import Table from "../components/table"

function BusTable(){
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async (session_id, navigate) => {
    const data = await getBuses(
      session_id,
      () => {},
      null,
      navigate
    )
    return data
  }
  return (
    <Table
      cols={["ID", "License No.", "Capacity", "Passengers", "Active"]}
      model="buses"
      inputs={[
        {type: "text", name: "license", required: true},
        {type: "number", name: "capacity", required: true}
      ]}
      addRow={addBus}
      updateRow={updateBus}
      fetchData={loadData}
      renderRows={(rows, user, permissions, setMode, setData, setDialog) => {
        return rows.filter((bus) => {
          const matchSearch = search === "" || bus.License.toLowerCase().includes(search.toLowerCase()) || String(bus.id).includes(search)
          const matchSelect = select === "All" || select === "active" && bus.active
          return matchSearch & matchSelect
        }).map((bus) => (
          <tr key={bus.id}>
            <td>{bus.id}</td>
            <td>{bus.license}</td>
            <td>{bus.capacity}</td>
            <td>{bus.passengers}</td>
            <td>{bus.active?'🟢':'🔴'}</td>
            {user?.is_admin || permissions.buses === 'w'?<td>
              <button onClick={() => {
                setData({
                  "id": bus.id,
                  "license": bus.license,
                  "capacity": bus.capacity
                })
                setMode(bus.id)
                setDialog(true)
              }}>Edit</button>
            </td>:""}
          </tr>
        ))
      }}>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Active">Active</option>
          <option value="Not Active">Not Active</option>
        </select>
      </div>
    </Table>
  )
}
export default BusTable