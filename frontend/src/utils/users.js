import { api_prefix, backend } from "../config";

async function getUsers(session_id="", callback = () => {}, errorCase = () => {}){
  const res = await fetch(backend+api_prefix+"admin/users/all/", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+session_id
    }
  })
  let data;
  try{data = await res.json()} catch (e) {data = null}
  if (!res.ok){
    let msg = data.detail? data.detail : null
    alert(msg)
    errorCase(res.status)
  } else  if (data && data.users){
    callback(data.users)
  }
  return data
}

async function addUser(formData, session_id="", callback = () => {}, errorCase = () => {}){
  const res = await fetch(backend+api_prefix+"admin/users/add/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+session_id
    },
    body: JSON.stringify(formData)
  })
  
  let data;
  try{data = await res.json()} catch (e) {data = null}
  if (!res.ok){
    let msg = data.detail? data.detail : null
    alert(msg)
    errorCase(res.status)
  } else  if (data && data.user){
    callback(data.user)
  }
  return data
}

async function updateUser(formData, session_id="", callback = () => {}, errorCase = () => {}){
  const res = await fetch(backend+api_prefix+"admin/users/update/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": session_id
    },
    body: JSON.stringify(formData)
  })
  let data;
  try{data = await res.json()} catch (e) {data = null}
  if (!res.ok){
    let msg = data.detail? data.detail : null
    alert(msg)
    errorCase(res.status)
  } else  if (data && data.user){
    callback(data.user)
  }
  return data
}

export {getUsers, addUser, updateUser}