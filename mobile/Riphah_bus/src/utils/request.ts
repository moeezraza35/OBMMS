import { api_prefix, backend } from "../config";

async function makeRequest(url:string, method:"POST"|"GET", session_id:string, body:any|null, callBack:Function, errorCase:Function){
  try{
    const res = await fetch(backend+api_prefix+url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": session_id,
      },
      body: body ? JSON.stringify(body) : null
    })
    const data = await res.json()
    callBack(data)
  } catch (e) {
    errorCase(e)
  }
}
export { makeRequest }