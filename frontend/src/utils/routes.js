import makeRequest from "./request"

async function getRoutes(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/routes/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.routes),
    errorCase,
    navigate
  )
}
async function addRoute(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/routes/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.route),
    errorCase,
    navigate
  )
}
async function updateRoute(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/routes/update/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.route),
    errorCase,
    navigate
  )
}
async function deleteRoute(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/routes/delete/",
    "POST",
    session_id,
    formData,
    () => callback(),
    errorCase,
    navigate
  )
}

export {getRoutes, addRoute, updateRoute, deleteRoute}