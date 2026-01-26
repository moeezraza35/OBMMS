import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoadingContext } from "../context/loading"
import { AuthContext } from "../context/auth"
import { addBus, getBuses, updateBus } from "../utils/buses"
import handleChange from "../utils/form"

function BusTable(){
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const [dialog, setdialog] = useState(false)
  const [formMode, setMode] = useState(0)
  const [formData, setData] = useState({
    "id":"",
    "license": "",
    "capacity": ""
  })
  const {setLoading} = useContext(LoadingContext)
  const {session_id, checkFlag} = useContext(AuthContext)
  const navigate = useNavigate()
  const loadData = async () => {
    setLoading(true)
    await getBuses(
      session_id,
      setRows,
      null,
      navigate
    )
  }
  useEffect(() => {
    loadData()
    .then(() => setLoading(false))
  }, [checkFlag])
  return(
    <>
      <div className={"dialog"+(dialog?" active":"")}>
        <form onSubmit={async e => {
          e.preventDefault()
          setLoading(true)
          formMode===0?await addBus(session_id, formData, data => {
            setRows(rows.concat(data))
            setdialog(false)
          }, res => alert(res.detail))
          :await updateBus(session_id, formData, data => {
            setRows(rows.filter(bus => {
              return bus.id !== data.id
            }).concat([data]))
            setdialog(false)
          })
          setLoading(false)
        }}>
          <input
            type="number"
            name="id"
            className="text-input"
            placeholder="ID #..."
            onChange={e => handleChange(e, setData)}
            value={formData.id}
            disabled={formMode!==0}/>
          <input
            type="text"
            name="license"
            className="text-input"
            placeholder="License No. ..."
            onChange={e => handleChange(e, setData)}
            value={formData.license}
            required/>
          <input
            type="number"
            name="capacity"
            className="text-input"
            placeholder="Capacity..."
            onChange={e => handleChange(e, setData)}
            value={formData.capacity}
            required/>
          <div className="flex gap-2">
            <input type="submit" value="Save" className="submit-input" />
            <input type="reset" value="Cancel" className="reset-input" onClick={() => {setdialog(false)}} />
          </div>
        </form>
      </div>
      <div className="flex gap-4 p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <select className="text-input" value={select} onChange={(e) => setSelect(e.target.value)}>
          <option value="All" defaultChecked>All</option>
          <option value="Active">Active</option>
          <option value="Not Active">Not Active</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>License No.</th>
            <th>Capacity</th>
            <th>Passengers</th>
            <th>Active</th>
            <th>
              <button onClick={() => setdialog(true)}>Add</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.filter((bus) => {
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
              <td>
                <button onClick={() => {
                  setData({
                    "id": bus.id,
                    "license": bus.license,
                    "capacity": bus.capacity
                  })
                  setMode(bus.id)
                  setdialog(true)
                }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
export default BusTable