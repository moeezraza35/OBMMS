import makeRequest from "./request"

async function getLocation(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/location/all/",
    "GET",
    session_id,
    null,
    (data) => {
      console.log("Location Data =", data)
      callback(data.location)
    },
    errorCase,
    navigate
  )
}
async function getActiveLocation(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "tracking/location/",
    "GET",
    session_id,
    null,
    (data) => callback(data),
    errorCase,
    navigate
  )
}
export { getLocation, getActiveLocation }
