import { useContext, useEffect, useState } from "react"
import { LoadingContext } from "../../context/loading"
import { AuthContext} from "../../context/auth"
import { getGroups } from "../../utils/group"
import { addUser, getUsers, updateUser } from "../../utils/users"
import { useNavigate } from "react-router-dom"

function UsersTable(){
  const [rows, setRows] = useState([])
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("All")
  const [dialog, setdialog] = useState(false)
  const [formMode, setMode] = useState(0) // 0 for add new and number for ID
  const [formData, setData] = useState({
    id: "",
    name: "",
    password: "",
    group: ""
  })
  const {setLoading} = useContext(LoadingContext)
  const {user, session_id, permissions} = useContext(AuthContext)
  const navigate = useNavigate()
  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value
    setData(values => ({...values, [name]: value}))
  }
  useEffect(() => {
    setLoading(true)
    getUsers(session_id, (data => {
      setRows(data)
    }), ((status) => {
      setLoading(false)
      switch(status){
        case 401:
          navigate("/login/")
          break
        default:
          navigate("/dashboard/")
          break
      }
    }))
    getGroups(session_id, data => {
      setGroups(data)
      setLoading(false)
    }, (status) => {
      setLoading(false)
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
          formMode===0?await addUser(formData, session_id, data => {
            setRows(rows.concat([data]))
            setdialog(false)
          }):await updateUser(formData, session_id, data => {
            setdialog(false)
            setRows(rows.filter(user => {
              return user.id !== data.id
            }).concat([data]))
          })
          setLoading(false)
        }}>
        <h3 className="mb-2">
          {formMode==0?"Add User":"Edit User"}
        </h3>
          <input
            type="number"
            name="id"
            className="text-input"
            placeholder="SAP ID..."
            onChange={(e) => handleChange(e)}
            disabled={formMode!==0}
            value={formData.id}/>
          <input
            type="text"
            name="name"
            className="text-input"
            placeholder="Full Name..."
            onChange={(e) => handleChange(e)}
            value={formData.name}
            required/>
          <input
            type="password"
            name="password"
            className="text-input"
            placeholder={(formMode===0?"Set":"Reset")+" Password..."}
            onChange={(e) => handleChange(e)}
            value={formData.password}
            required={formMode===0}/>
          <select
            name="group"
            className="text-input"
            onChange={(e) => handleChange(e)}
            value={formData.group || ""}>
            <option value="">--Not Selected--</option>
            <option value="Admin">Admin</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
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
          <option value="Admin">Admin</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Group</th>
            <th>Active</th>
            {user?.is_admin || permissions.users==='w'?<th><button onClick={() => {
              setMode(0)
              setdialog(true)
            }}>Add</button></th>:""}
          </tr>
        </thead>
        <tbody>
          {rows.filter((user) => {
            const matchSearch = search === "" || user.name.toLowerCase().includes(search.toLowerCase()) || String(user.id).includes(search)
            const matchSelect = select === "All" || (select === "Admin" && user.is_admin) || (select == user.group)
            return matchSearch && matchSelect
          }).map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.is_admin?"Admin":(groups.find(group => group.id == row.group)?.name ?? "")}</td>
              <td>{row.active?'🟢':'🔴'}</td>
              {user?.is_admin || permissions.users==='w'?<td><button onClick={() => {
                setMode(row.id)
                setData({
                  "id": row.id,
                  "name": row.name,
                  "password": "",
                  "group": row.is_admin ? "Admin" : String(row.group)
                })
                setdialog(true)
              }}>Edit</button></td>:""}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
export default UsersTable