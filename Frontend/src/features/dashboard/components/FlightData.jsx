import { useDispatch, useSelector } from "react-redux";
import Pagination from "../../../components/Pagination";
import { useEffect,useRef } from "react";
import { fetchFlightData } from "../../../stores/flightData/flightData";
import Container from "../../../components/Container";
const FlightData = () => {
  // const dispatch=useDispatch();
  // const {flightData,loading,error}= useSelector(
  //   (state)=>state.flightData || {}
  // );
  // useEffect(()=>{
  //   dispatch(fetchFlightData());
  // },[dispatch]);
  // console.log("Flight Data",flightData);
  // if(loading) return <p>Loading....</p>
  // if(error) return <p>error</p>
  const reconnectInterval = useRef(null);
  const ws =useRef(null);
  useEffect(()=>{
    let timeout;
    const connectWebSocket=()=>{
      console.log("Attempting WebSocket connection...");
      const wsUrl = "ws://3.34.40.154:8080/telemetry";
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen=()=>{
        console.log("Websocket connected.");
        if(reconnectInterval.current){
          clearInterval(reconnectInterval.current);
          reconnectInterval.current=null;
        }
      };
      ws.current.onmessage=(event)=>{
        clearTimeout(timeout);
      
      try{
        const data=JSON.parse(event.data);
        console.log("websocket data:",data);
      }catch(error){
        console.error("Error parsing websocket data:",error)
      }
      timeout=setTimeout(()=>{
        console.log("No drone update in 5s, clearing...")
      })
    }

    ws.current.onerror=(error)=>{
      console.error("WebSocket error:", error);
    }
    ws.current.onclose = () => {
      console.warn("WebSocket disconnected, retrying...");
      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(connectWebSocket, 5000);
      }
    };
  }
  connectWebSocket();
  
  return () => {
    if (ws.current) ws.current.close();
    if (reconnectInterval.current) clearInterval(reconnectInterval.current);
    clearTimeout(timeout); // Clean timeout on unmount
  };
  },[]);
  return (
  <Container>
  <div className="overflow-x-auto p-10 bg-white border table-auto rounded-md">
    <table className="min-w-full">
      <thead className="bg-gray-50 rounded-md border">
        <tr className="bg-gray-200 rounded-md border">
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Date/Time
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Drone ID
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Vessels
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Alt
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Lat
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Lon
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Wind Vel (m/s)
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Time in Air (min.sec)
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            GPS HDOP
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            Battery (V)
          </th>
          <th className="px-2 py-4 text-center text-sm font-medium text-gray-600">
            CH3OUT
          </th>
        </tr>
      </thead>
      <tbody>
        {/* Add your dynamic table rows here */}
        {/* {data.map((data,i)=>(
          <tr key={i}>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.date_time}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.droneId}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.vessels}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.alt}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.lat}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.lon}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.wind_vel}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.time_in_air}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.gps_hdop}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.battery}</td>
          <td className="px-2 py-4 text-center border-b border-gray-300">{data.ch3out}</td>
        </tr>
        ))} */}
        
        {/* Add more rows here */}
      </tbody>
    </table>
    <Pagination/>
  </div>
</Container>

    
  );
};

export default FlightData;