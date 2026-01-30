import makeRequest from "./request";

async function getUsers(session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/users/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.users),
    errorCase,
    navigate
  )
  return data?.users || []
}

async function addUser(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/users/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.user),
    errorCase,
    navigate
  )
  return data.user
}

async function updateUser(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/users/update",
    "POST",
    session_id,
    formData,
    (data) => callback(data.user),
    errorCase,
    navigate
  )
  return data.user
}

export {getUsers, addUser, updateUser}