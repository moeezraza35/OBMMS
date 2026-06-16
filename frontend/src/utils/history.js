import makeRequest from "./request"

async function getHistory(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/history/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.history),
    errorCase,
    navigate
  )
}
async function deleteHistory(formData={}, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/history/delete/",
    "POST",
    session_id,
    formData,
    callback,
    errorCase,
    navigate
  )
}

export {getHistory, deleteHistory}