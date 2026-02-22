import makeRequest from "./request";

async function getUsers(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/users/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.users),
    errorCase,
    navigate
  )
}
async function getDrivers(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "auth/drivers/",
    "GET",
    session_id,
    null,
    (data) => callback(data.drivers),
    errorCase,
    navigate
  )
}
async function getUsersName(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "auth/users/",
    "GET",
    session_id,
    null,
    (data) => callback(data.users),
    errorCase,
    navigate
  )
}
async function addUser(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/users/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.user),
    errorCase,
    navigate
  )
}
async function updateUser(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/users/update",
    "POST",
    session_id,
    formData,
    (data) => callback(data.user),
    errorCase,
    navigate
  )
}
async function deleteUser(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/users/delete",
    "POST",
    session_id,
    formData,
    () => callback(),
    errorCase,
    navigate
  )
}
export {getUsers, getDrivers, getUsersName, addUser, updateUser, deleteUser}