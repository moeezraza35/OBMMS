import { useState } from "react"
import { getUsers } from "../utils/users"
import { getPackages, addPackages, updatePackages, deletePackages } from "../utils/packages"
import { static_dir } from "../config"
import Table from "../components/table"

function PackagesTable(){
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const loadData = async (session_id, navigate=null) => {
    const data = await getPackages(
      session_id,
      () => {},
      null,
      navigate
    )
    return data
  }
  return (
    <Table
      cols={["ID", "User", "Price", "Amount", "Installments", "Start", "End", "Active"]}
      model="packages"
      inputs={[
        {type: "select", name: "user", values: [{value: "", label: "--Not-Selected--"}]},
        {type: "number", name: "price", placeholder: "Price...", required: true},
        {type: "number", name: "amount", placeholder: "Add Amount..."},
        {type: "number", name: "Installments"},
        {type: "date", name: "Start Date", required: true},
        {type: "date", name: "End Date", required: true},
        {type: "checkbox", name: "active", placeholder:""}
      ]}
      addRow={addPackages}
      updateRow={updatePackages}
      fetchData={loadData}
      renderRows={(rows, user, permissions, setMode, setData, setDialog) => {return rows.filter((packages) => {
        // const matchSearch = search === "" || user.name.toLowerCase().includes(search.toLowerCase()) || String(user.id).includes(search)
        // const matchSelect = select === "All" || (select === "Admin" && user.is_admin) || (select == user.group)
        return true
      }).map(row => (
        <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.user}</td>
          <td>Rs. {row.price}</td>
          <td>{row.amount}</td>
          <td>{row.installments}</td>
          <td>{row.start}</td>
          <td>{row.end}</td>
          {/* <td>{row.is_admin?"Admin":(groups.find(group => group.id == row.group)?.name ?? "")}</td> */}
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
          <option value="">User 1</option>
        </select>
      </div>
    </Table>
  )
}
export default PackagesTable