import { MapContainer, TileLayer, Marker, Polyline, Popup} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TopBar from "../../components/TopBar";
import { RxCross2 } from "react-icons/rx";
import { IoInformationCircle } from "react-icons/io5";
import { useEffect, useMemo, useRef, useState } from "react";
import FlightMapDetails from "./FlightMapDetails";
import { IoMdSearch } from "react-icons/io";
import { AiOutlineMenu } from "react-icons/ai";
import { FaMap } from "react-icons/fa";
import { BsFillPrinterFill } from "react-icons/bs";
import useTranslations from "../../../../components/Language";
import Footer from "../../../../components/Footer";


const RealTimeInfo = () => {
  // const [ships, setShips] = useState([]);
  const [drones, setDrones] = useState({});
  const [selectedDrone, setSelectedDrone] = useState({});
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [altt, setAltt] = useState(0);
  const [airSpeed, setAirSpeed] = useState(0);
  const [groundSpeed, setGroundSpeed] = useState(0);
  const [battery, setBattery] = useState(0);
  const [systemID, setSystemID] = useState("");
  const [shipPosition, setShipPosition] = useState([]);
  const reconnectInterval = useRef(null);

  // console.log(selectedDrone)

  // console.log(systemID)
  // console.log(shipPosition)
  // const [droneStates, setDroneStates] = useState(
  //   data.drones.reduce((acc, drone) => {
  //     acc[drone.id] = {
  //       position: drone.position,
  const droneIcon = (rotation) => 
    new L.DivIcon({
      className: "custom-drone-icon",
      html: `<div style="transform: rotate(${rotation}deg);"><img src="droneIcon.png" width="40" height="40"/></div>`,
      iconSize: [25, 25],
    });

    const carIcon = (rotation) => 
      new L.DivIcon({
        className: "custom-drone-icon",
        html: `<div style="transform: rotate(${rotation}deg);"><img src="icon_car.png" width="80" height="80"/></div>`,
        iconSize: [25, 25],
      });

    function HeadingLine({ position, heading }) {
      const length = 0.035; // You can tune this for visual size
      const angleRad = (heading * Math.PI) / 180;
      const endLat = position[0] + length * Math.cos(angleRad);
      const endLng = position[1] + length * Math.sin(angleRad);
      const line = [position, [endLat, endLng]];
      return <Polyline positions={line} color="#f20530" opacity={0.8}
      weight={1.7} />;
    }

  function HeadingLineOrange({ position, heading }) {
      const length = 0.15; // You can tune this for visual size
      const angleRad = (heading * Math.PI) / 180;
      const endLat = position[0] + length * Math.cos(angleRad);
      const endLng = position[1] + length * Math.sin(angleRad);
      const line = [position, [endLat, endLng]];
      return <Polyline positions={line} color="#FF4D00" opacity={0.8}
      weight={1.7} />;
    }

  function HeadingLineGreen({ position, heading }) {
      const length = 0.15; // You can tune this for visual size
      const angleRad = (heading * Math.PI) / 180;
      const endLat = position[0] + length * Math.cos(angleRad);
      const endLng = position[1] + length * Math.sin(angleRad);
      const line = [position, [endLat, endLng]];
      return <Polyline positions={line} color="#02a32d" opacity={0.8}
      weight={1.7} />;
    }

    const handleSearchFocus = () => {
      searchRef.current.focus();
    };

    // const shipIcons = [
    //   "vessel(Navy).png",
    //   "vessel(blue).png",
    //   "vessel(green).png",
    //   "vessel(lightYellow).png",
    //   "vessel(olive).png",
    //   "vessel(orange).png",
    //   "vessel(pink).png",
    //   "vessel(Purple).png",
    //   "vessel(red).png",
    //   "vessel(Yellow).png",
    // ];
    
    // const getShipIcon = (index) => {
    //   const hash = index;
    //   return shipIcons[hash % shipIcons.length];
    // };
    
    // const shipsWithIcons = useMemo(() => {
    //   return shipPosition.map((ship, index) => ({
    //     ...ship,
    //     icon: getShipIcon(index),
    //   }));
    // }, [shipPosition]);

    // console.log(shipsWithIcons)
    
    

  //       index: 0,
  //     };
  //     return acc;
  //   }, {})
  // );
  // const intervalRefs = useRef({});
  // const animationActiveRefs = useRef({});

  const ws = useRef(null);

  useEffect(() => {
    let timeout;
  
    const connectWebSocket = () => {
      console.log("Attempting WebSocket connection...");
      const wsUrl = "ws://13.209.33.15:8080/telemetry";
      ws.current = new WebSocket(wsUrl);
  

      ws.current.onopen = () => {
        console.log("WebSocket connected.");
        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current);
          reconnectInterval.current = null;
        }
      };
  
      ws.current.onmessage = (event) => {
        clearTimeout(timeout); // reset timeout on message
  
        try {
          const data = JSON.parse(event.data);
          if (data.drones && Array.isArray(data.drones)) {
            const updatedDrones = {};
            let updatedLat = null;
            let updatedLon = null;
            let updatedAlt = null;
            let updatedAirSpeed = null;
            let updatedGroundSpeed = null;
            let updatedBattery = null;
  
            data.drones.forEach((drone) => {
              drone.waypoints = Array.isArray(drone.waypoints) ? drone.waypoints : [];
              updatedDrones[drone.GCS_IP] = drone;
              updatedLat = `${Math.abs(drone.lat)}° ${drone.lat >= 0 ? "N" : "S"}`;
              updatedLon = `${Math.abs(drone.lon)}° ${drone.lat >= 0 ? "E" : "W"}`;
              updatedAlt = drone.alt;
              updatedAirSpeed = drone.airspeed;
              updatedGroundSpeed = drone.ground_speed;
              updatedBattery = drone.battery_current;
            });
  
            setDrones(updatedDrones);
            setLat(updatedLat);
            setLon(updatedLon);
            setAltt(updatedAlt);
            setAirSpeed(updatedAirSpeed);
            setGroundSpeed(updatedGroundSpeed);
            setBattery(updatedBattery);
  
            // console.log(updatedDrones);
          } else {
            console.warn("Invalid WebSocket data:", data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
  
        // 🔁 If no data received in 5s, clear the drone state
        timeout = setTimeout(() => {
          console.log("No drone update in 5s, clearing...");
          setDrones({});
        }, 5000);
      };
  
      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
  
      ws.current.onclose = () => {
        console.warn("WebSocket disconnected, retrying...");
        if (!reconnectInterval.current) {
          reconnectInterval.current = setInterval(connectWebSocket, 5000);
        }
      };
    };
  
    connectWebSocket();
  
    return () => {
      if (ws.current) ws.current.close();
      if (reconnectInterval.current) clearInterval(reconnectInterval.current);
      clearTimeout(timeout); // Clean timeout on unmount
    };
  }, []);
  

  
const [videoView, setVideoView] = useState(false);
  const [wayPointsVisible, setWayPointsVisible] = useState(true);
  const [gpsDetails, setGpsDetails] = useState(false);

  const searchRef = useRef(null);

  const shipData = [
    {
      Vessel: "Serena Ver.2",
      Captain: "name",
      Latitude: selectedDrone?.home_location?.lat ?? 0,
      Longitude: selectedDrone?.home_location?.lon ?? 0,
      // Latitude: lat,
      // Longitude: lon,
    },
  ];

  const ws_Gps = useRef(null);
  const reconnectGpsInterval = useRef(null);
  const timeoutRef = useRef(null);
  const [heading, setHeading] = useState(0);

  const [topGpsData, setTopGpsData] = useState({
    Latitude: 16.816586,
    Longitude: 96.192868,
    Altitude: 0,
    Speed: 0,
    Satellites: 0,
  });

  const [bottomGpsData, setBottomGpsData] = useState({
    Latitude: 0,
    Longitude: 0,
    Altitude: 0,
    Speed: 0,
    Satellites: 0,
  });

  useEffect(() => {
    const connectWebSocket = () => {
      console.log("Attempting WebSocket connection...");
      const wsUrl = "ws://192.168.171.42:8765";
      ws_Gps.current = new WebSocket(wsUrl);

      ws_Gps.current.onopen = () => {
        console.log("WebSocket connected.");
        if (reconnectGpsInterval.current) {
          clearInterval(reconnectGpsInterval.current);
          reconnectGpsInterval.current = null;
        }
      };

      ws_Gps.current.onmessage = (event) => {
        clearTimeout(timeoutRef.current);

        try {
          const data = JSON.parse(event.data);
          setHeading(data.heading);

          // ✅ Handle Top/Bottom GPS Data
          if (Array.isArray(data.gps_data)) {
            data.gps_data.forEach((gps) => {
              const gpsInfo = {
                Latitude: gps.latitude,
                Longitude: gps.longitude,
                Altitude: gps.altitude,
                Speed: gps.speed,
                Satellites: gps.satellites,
              };

              if (gps.gps === "top_gps") {
                setTopGpsData(gpsInfo);
              } else if (gps.gps === "bottom_gps") {
                setBottomGpsData(gpsInfo);
              }
            });
          }

        } catch (err) {
          console.error("Error parsing WebSocket data:", err);
        }

        timeoutRef.current = setTimeout(() => {
          console.log("No GPS update in 5s, clearing...");
          setTopGpsData((prev) => ({ ...prev, Latitude: 0, Longitude: 0 }));
          setBottomGpsData((prev) => ({ ...prev, Latitude: 0, Longitude: 0 }));
        }, 5000);
      };

      ws_Gps.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws_Gps.current.onclose = () => {
        console.warn("WebSocket disconnected. Attempting reconnect...");
        if (!reconnectInterval.current) {
          reconnectGpsInterval.current = setInterval(connectWebSocket, 5000);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws_Gps.current) ws.current.close();
      if (reconnectGpsInterval.current) clearInterval(reconnectGpsInterval.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);


  const droneDataStatic = [
    {
      "Model": systemID != null ? `VT${String(systemID).padStart(3, '0')}/${systemID}` : "VT000",
      "Serial No": "MDT290I24060801",
      Latitude: lat,
      Longitude: lon,
      Altitude: altt+" M",
    }
  ];

  const droneRealTimeData = [
    {
      Latitude: lat,
      Longitude: lon,
      "Altitude": altt+" M",
      "Airspeed(m/s)": airSpeed,
      "Groundspeed(m/s)": groundSpeed,
      "Battery(V)": battery,
    }
  ];

  // console.log(altt)

  const handleSelectedDrone = (systemID) => {
    const droneList = Object.values(drones); // convert to array
    const clickedDrone = droneList.find(drone => drone.system_id === systemID) || null;
    setSelectedDrone(clickedDrone);
  };


  return (
    <div className="w-full relative flex flex-col min-h-screen">
      <div className="absolute top-0 left-0 w-full bg-transparent z-40 flex flex-col gap-2 p-3">
        <TopBar />
      </div>


    {/* GPS details */}
    {gpsDetails && (
      <>
        <div className="absolute top-[60px] left-7 xl:w-[300px] lg:w-3/12 h-6/6 bg-white z-40 flex flex-col rounded-md shadow-md">
          <div className="w-full pt-1 pb-1 pl-3 pr-3 flex justify-between items-center bg-transparent shadow-md">
            <span className="font-semibold">GPS details</span>
            <div className="flex justify-center items-center gap-2">
              <RxCross2 size={"20px"} onClick={() => setGpsDetails(!gpsDetails)} className="text-primary cursor-pointer" />
            </div>
            
          </div>

          <div className="w-full object-contain">
            <img src="NissanSunny.png" alt="Car Image" className="w-full h-44" />
          </div>


          <div className="w-full flex pb-1 pl-3 flex-col">
            <div className="w-full flex items-center justify-start gap-1 mt-2">
              <div className="flex justify-center items-center text-[16px] text-center font-semibold text-red-500">Top GPS</div>
              <IoInformationCircle size={"20px"} className="text-gray-400" />
            </div>
            <div className="w-full flex flex-wrap mt-2 border-b-0.5 text-[14px]">
              {Object.entries(topGpsData).map(([key, value]) => (
                <div className="w-1/2 flex flex-col mb-1" key={key}>
                  <div className="w-full flex items-center text-[12px] text-gray-500">{key}</div>
                  <div className="w-full flex items-center font-semibold text-red-500">{value}</div>
                </div>
              ))}
            </div>
          </div>


          <div className="w-full flex pb-1 pl-3 flex-col">
            <div className="w-full flex items-end justify-start gap-1">
              <div className="flex justify-center items-center text-[16px] text-center font-semibold text-primary">Bottom GPS</div>
              <IoInformationCircle size={"20px"} className="text-gray-400" />
            </div>

            <div className="w-full flex flex-wrap mt-1 border-b-0.5 text-[14px]">
              {Object.entries(bottomGpsData).map(([key, value]) => (
                <div className="w-1/2 flex flex-col mb-1" key={key}>
                  <div className="w-full flex items-center text-[12px] text-gray-500">{key}</div>
                  <div className="w-full flex items-center font-semibold text-primary">{value}</div>
                </div>
              ))}
            </div>
        </div>
        </div>
      </>)}


      <div className="w-full flex-1 relative">

      <MapContainer
          center={[-29.149889, -136.958702]}
          zoom={3}
          minZoom={2.5}
          maxZoom={18}
          style={{ height: "100vh", width: "100%" }}
          className="z-0 w-screen h-full" zoomControl={false}
          trackResize={true}
          attributionControl={false}
          // maxBounds={[[-85, -180], [85, 180]]}
          maxBounds={[[-85, -360], [85, 360]]} 
          maxBoundsViscosity={1.0}
          worldCopyJump={true} // enables world map repetition when panning
          continuousWorld={true} // allows smooth wrap-around
          >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {/* {shipsWithIcons.map((ship, index) => (
                          <Marker
                            key={index}
                            position={[ship.lat, ship.lon]}
                            icon={new L.Icon({
                              iconUrl: ship.icon,  
                              iconSize: [20, 20],
                              iconAnchor: [20, 40],
                              popupAnchor: [0, -40],
                            })}
                            eventHandlers={{ click: () => setShipDetails(true) }}
                          />
                        ))} */}
              {Object.values(drones).map((drone, index) => (
                <>
                <Marker
                  key={index}
                  position={[drone.lat, drone.lon]}
                  icon={droneIcon(drone.yaw)}
                  eventHandlers={{ click: () => {setVideoView(true);
                                                 setGpsDetails(false);
                  },
                  mouseover: () => {setSystemID(drone.system_id); handleSelectedDrone(drone.system_id);},
                  }}
                >
                <HeadingLine position={[drone.lat, drone.lon]} heading={drone.heading} />
                <HeadingLineOrange position={[drone.lat, drone.lon]} heading={drone.target_heading} />
                <HeadingLineGreen position={[drone.lat, drone.lon]} heading={drone.previous_heading / 100} />
                  <Popup>
                    <div>
                    <strong>Drone id:</strong> VT{String(drone.system_id).padStart(3, '0')} / {drone.system_id} <br />
                      <strong>Latitude:</strong> {drone.lat} N<br />
                      <strong>Longitude:</strong> {drone.lon} E<br />
                      <strong>Altitude(m):</strong> {drone.alt} m <br />
                    </div>
                  </Popup>
                </Marker>
                <Polyline
                key={drone.GCS_IP}
                positions={drone.waypoints.map((waypoint) => [waypoint.lat, waypoint.lon])}
                color="red"
                opacity={0.5}
                weight={2}
                dashArray="5, 10"
              />
              </>
              ))}
              <Marker
                  key={topGpsData.Satellites}
                  position={[topGpsData.Latitude, topGpsData.Longitude]}
                  icon={carIcon(heading)}
                  eventHandlers={{ click: () => {setGpsDetails(true);
                  },
                  }}
                >
                  <Popup>
                    <strong>Heading: </strong>{heading}<br />
                  </Popup>
                </Marker>
            </MapContainer>
      </div>

      {videoView && <FlightMapDetails videoView={videoView} setVideoView={setVideoView} systemID={systemID}/>}

    </div>
  );
};

export default RealTimeInfo;
