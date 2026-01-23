import makeRequest from "./request";

async function getModels(session_id="", callback=()=>{}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/models/",
    "GET",
    session_id,
    null,
    data => callback(data.models),
    errorCase,
    navigate
  )
  return data
}
export {getModels}