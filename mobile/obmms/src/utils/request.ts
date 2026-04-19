import { Alert, BackHandler } from "react-native";
import { api_prefix, backend } from "../config";
import { navigate } from "./navigation";

async function makeRequest(url:string, method:"POST"|"GET", session_id:string, body:any|null, callBack:Function, errorCase:Function|null){
  if (errorCase == null){
    errorCase = (res:{detail:string, status:Number}) => {
      switch(res.status){
        case 401:
          navigate("Login")
          break
        case 403:
          break
        case 500:
          Alert.alert("Internal Server Error", "Please try again later.", 
            [
              {
                text: "OK",
                onPress: () => BackHandler.exitApp()
              }
            ])
          break
        case 0:
          Alert.alert("Connection Error", "Cannot connect to server, please check your internet connection", 
            [
              {
                text: "OK",
                onPress: () => BackHandler.exitApp()
              }
            ])
        default:
          Alert.alert(res.detail)
          navigate("Home")
          break
      }
    }
  }
  try{
    const res = await fetch(backend+api_prefix+url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": session_id,
      },
      body: body ? JSON.stringify(body) : null
    })
    let data = null;
    try{data = await res.json()} catch(e) {data = null}
    if (!res.ok){
      const result = {
        "detail": data.detail? data.detail : "An unexpected error occured, please try again.",
        "status": res.status
      }
      await errorCase(result)
      return result
    }
    callBack(data)
  } catch (e) {
    const result = {
      detail: "An unexpected error occured, please try again.",
      status: 0
    }
    errorCase(result)
  }
}
export { makeRequest }