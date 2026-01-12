import { api_prefix, backend } from "../config";

async function getUsers(session_id=""){
  const res = await fetch(backend+api_prefix+"admin/users/all/", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+session_id
    }
  })
  const data = await res.json()
  return data
}

async function addUser(formData, session_id=""){
  const res = await fetch(backend+api_prefix+"admin/users/add/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+session_id
    },
    body: JSON.stringify(formData)
  })
  const data = await res.json()
  return data
}

async function updateUser(formData, session_id=""){
  const res = await fetch(backend+api_prefix+"admin/users/update/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": session_id
    },
    body: JSON.stringify(formData)
  })
  const data = await res.json()
  return data
}

export {getUsers, addUser, updateUser}