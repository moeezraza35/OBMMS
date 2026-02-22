import makeRequest from "./request"

async function getPackages(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/packages/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.packages),
    errorCase,
    navigate
  )
}
async function addPackages(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/packages/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.package),
    errorCase,
    navigate
  )
}
async function updatePackages(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/packages/update/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.package),
    errorCase,
    navigate
  )
}
async function deletePackages(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/packages/delete/",
    "POST",
    session_id,
    formData,
    () => callback(),
    errorCase,
    navigate
  )
}

export {getPackages, addPackages, updatePackages, deletePackages}