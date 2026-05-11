import { useEffect, useState } from "react"
import { getPackages, addPackages, updatePackages, deletePackages } from "../utils/packages"
import { static_dir } from "../config"
import Table from "../components/table"
import Dialog from "../components/dialog"

function PackagesTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [search, setSearch] = useState("")
  const dialogProp = { dialog, formMode, formData, addRow: addPackages, updateRow: updatePackages, setData, setDialog, setRows }
  const loadData = async () => {
    if (!checkFlag) return
    setRows([])
    setLoading(true)
    await getPackages(session_id, setRows, null, navigate)
    // await getUsersName(session_id, setUsers, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
        inputs={[
          {type: "number", name: "user", placeholder: "User ID...", required: true},
          {type: "number", name: "price", placeholder: "Price...", required: true},
          {type: "select", name: "month", values: [
            {value: "", label: "--select-month--"},
            {value: 1, label: "January"},
            {value: 2, label: "February"},
            {value: 3, label: "March"},
            {value: 4, label: "April"},
            {value: 5, label: "May"},
            {value: 6, label: "June"},
            {value: 7, label: "July"},
            {value: 8, label: "August"},
            {value: 9, label: "September"},
            {value: 10, label: "October"},
            {value: 11, label: "November"},
            {value: 12, label: "December"},
          ]},
          {type: "number", name: "year", required: true},
          {type: "checkbox", name: "active", placeholder:""}
        ]}
        {...dialogProp}>Package</Dialog>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      <Table
        cols={["ID", "User", "Price", "Month", "Year", "Active"]}
        permission={user?.is_admin || permissions.packages === 'w'}
        setMode={setMode}
        setDialog={setDialog}
        renderRows={() => {
          return rows.filter((packages) => {
            return packages.id.toString().includes(search) ||
            packages.user.toString().includes(search)
          }).map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>ID: {row.user}</td>
              <td>Rs. {row.price}</td>
              <td>{row.month}</td>
              <td>{row.year}</td>
              <td>{row.active?'🟢':'🔴'}</td>
              {user?.is_admin || permissions.packages==='w'?<td>
                <button className="edit-btn" onClick={() => {
                  setMode(row.id)
                  setData({
                    id: row.id,
                    user: row.user,
                    price: row.price,
                    month: row.month,
                    year: row.year,
                    active: row.active
                  })
                  setDialog(true)
                }}><img src={static_dir+"images/icons/edit.svg"}/></button>
            <button onClick={() => deletePackages({id: row.id}, session_id, () => {
              setRows(prev => prev.filter(r => r.id !== row.id))
            }, null, navigate)} className="del-btn"><img src={static_dir+"images/icons/delete.svg"} /></button>
          </td>:""}
        </tr>
      ))}}/>
    </>
  )
}
export default PackagesTable