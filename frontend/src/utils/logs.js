import makeRequest from "./request"

async function getLogs(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/logs/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.logs),
    errorCase,
    navigate
  )
}
async function deleteLogs(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/logs/delete/",
    "POST",
    session_id,
    formData,
    () => callback(),
    errorCase,
    navigate
  )
}

export {getLogs, deleteLogs}