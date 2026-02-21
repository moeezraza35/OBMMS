import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import { static_dir } from "../config"

function Table({cols=[], permission=false, setMode=()=>{}, setDialog=()=>{}, renderRows=()=>{}}){
  return (
    <table>
      <thead>
        <tr>
          {cols.map(col => (
          <th key={col}>{col}</th>
          ))}
          {permission?<th>
            <button className="add-btn" onClick={() => {
              setMode(0)
              setDialog(true)
            }}><img src={static_dir+"images/icons/add.svg"}/></button>
          </th>:""}
        </tr>
      </thead>
      <tbody>
        {renderRows()}
      </tbody>
    </table>
  )
}
export default Table