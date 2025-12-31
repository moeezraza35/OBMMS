import { useEffect, useState } from "react"
import { api_prefix, backend } from "../config"

function UsersTable(){
  const [rows, setRows] = useState([])
  useEffect(() => {
    fetch(backend+api_prefix+"admin/users/all/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type" : "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      setRows(data.users)
    })
    .catch(e => console.log("Unable to fetch user data",e))
  }, [])
  return (
    <>
      <div className="p-4">
        <input type="search" className="text-input" placeholder="Search"/>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Group</th>
            <th>Active</th>
            <th><button>Add</button></th>
          </tr>
        </thead>
        <tbody className="text-center">
          {rows.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.is_admin?"Admin":user.group}</td>
              <td>{user.active?'🟢':'🔴'}</td>
              <td><button>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
export {UsersTable}