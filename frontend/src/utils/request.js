import { api_prefix, backend } from "../config";

async function makeRequest(url, method="GET", session_id="", formData={}, callback=async()=>{}, errorCase=null, navigate=null){
  if (errorCase == null || errorCase == undefined){
    errorCase = (res) => {
      console.warn(res.detail)
      switch(res.status){
        case 401:
          navigate("/login/")
          break
        default:
          alert(res.detail)
          navigate("/dashboard/")
          break
      }
    }
  }
  const options = {
    method: method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+session_id
    }
  }
  if (method === "POST"){
    options.body = JSON.stringify(formData)
  }
  const res = await fetch(backend+api_prefix+url, options)
  let data
  try {data = await res.json()} catch(e) {data = null}
  if (!res.ok){
    const result = {
      "detail": data.detail? data.detail : "An unexpected error occured, please try again.",
      "status": res.status
    }
    await errorCase(result)
    return result
  }
  await callback(data)
  return data
}
export default makeRequest
