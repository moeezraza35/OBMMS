import Location from "./location"

function BusTable(){
  return(
    <>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>License No.</th>
          <th>Capacity</th>
          <th>Passengers</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>LWK-07-5647</td>
          <td>20</td>
          <td>0</td>
          <td>🟢🔴</td>
        </tr>
      </tbody>
    </table>
    </>
  )
}
export default BusTable