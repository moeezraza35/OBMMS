import { useContext, useState, useEffect } from "react"
import { LoadingContext } from "../../context/loading"
import { AuthContext } from "../../context/auth"
import { addGroup, getGroups, updateGroup } from "../../utils/group"
import { useNavigate } from "react-router-dom"

function GroupTable({ models }){
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState(false)
  const [formMode, setMode] = useState(0) // 0 for Add and number for ID
  const [formData, setData] = useState({
    "id" : "",
    "name" : "",
  })
  const { setLoading } = useContext(LoadingContext)
  const {user, permissions, session_id} = useContext(AuthContext)
  const navigate = useNavigate()
  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value
    setData(values => ({...values, [name]: value}))
  }
  const setModelData = () => {
    setData(prev => {
      const next = {...prev}
      models.forEach(m => { if (!(m in next)) next[m] = "" })
      return next
    })
  }
  useEffect(() => {
    setModelData()
  }, [models])
  useEffect(() => {
    setLoading(true)
    getGroups(session_id, data => {
      setRows(data)
      setLoading(false)
    }, (status) => {
      switch(status){
        case 401:
          navigate("/login/")
          break
        default:
          navigate("/dashboard/")
          break
      }
    })
  }, [])
  return (
    <>
      <div className={"dialog"+(dialog?" active":"")}>
        <form onSubmit={async e => {
          setLoading(true)
          e.preventDefault()
          formMode===0?await addGroup(formData, session_id, data => {
            setDialog(false)
            setRows(rows.concat([data]))
          }):await updateGroup(formData, session_id, data => {
            setDialog(false)
            setRows(rows.filter(group => {
              return group.id !== data.id
            }).concat(data))
          })
          setLoading(false)
        }}>
          <h3 className="mb-2">
            {formMode===0?"Add Group":"Edit Group"}
          </h3>
          <input
            type="number"
            name="id"
            className="text-input"
            placeholder="Group Id..."
            onChange={handleChange}
            value={formData.id}
            disabled={formMode!==0}/>
          <input
            type="text"
            name="name"
            className="text-input"
            placeholder="Group Name..."
            onChange={handleChange}
            value={formData.name}
            required/>
          {models.map(model => (
            <div key={""+model} className="flex">
              <label htmlFor={"select-"+model} className="p-2 capitalize">{model}</label>
              <select
                name={model}
                className="text-input"
                id={"select-"+model}
                onChange={handleChange}
                value={formData[model] || ""}>
                <option value="">Not Allowed</option>
                <option value="r">Read Only</option>
                <option value="w">Read & Write</option>
              </select>
            </div>
          ))}
          <div className="flex gap-2">
            <input type="submit" className="submit-input" value="Save" />
            <input type="reset" className="reset-input" value="Cancel" onClick={() => setDialog(false)} />
          </div>
        </form>
      </div>
      <div className="p-4">
        <input type="search" className="text-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            {user?.is_admin || permissions.group==='w'?<th><button onClick={() => {
              setData({
                "id": "",
                "name": ""
              })
              setModelData()
              setMode(0)
              setDialog(true)
            }}>Add</button></th>:""}
          </tr>
        </thead>
        <tbody>
          {rows.filter((group) => {
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
          ))}
        </tbody>
      </table>
    </>
  )
}
export default GroupTable