import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TopBar from "../../components/TopBar";
import { RxCross2 } from "react-icons/rx";
import { IoInformationCircle } from "react-icons/io5";
import { useEffect, useMemo, useRef, useState } from "react";
import FlightMapDetails from "./FlightMapDetails";
// import { IoMdSearch } from "react-icons/io";
// import { AiOutlineMenu } from "react-icons/ai";
// import { FaMap } from "react-icons/fa";
// import { BsFillPrinterFill } from "react-icons/bs";
// import useTranslations from "../../../../components/Language";
// import Footer from "../../../../components/Footer";


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
  const [videoView, setVideoView] = useState(false);
  const [shipDetails, setShipDetails] = useState(false);
  const [gpsDetails, setGpsDetails] = useState(true);
  const searchRef = useRef(null);

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
      const length = 0.065; // You can tune this for visual size
      const angleRad = (heading * Math.PI) / 180;
      const endLat = position[0] + length * Math.cos(angleRad);
      const endLng = position[1] + length * Math.sin(angleRad);
      const line = [position, [endLat, endLng]];
      return <Polyline positions={line} color="#f20530" opacity={0.8}
      weight={1.7} />;
    }

  function HeadingLineOrange({ position, heading }) {
      const length = 0.065; // You can tune this for visual size
      const angleRad = (heading * Math.PI) / 180;
      const endLat = position[0] + length * Math.cos(angleRad);
      const endLng = position[1] + length * Math.sin(angleRad);
      const line = [position, [endLat, endLng]];
      return <Polyline positions={line} color="#fcc44c" opacity={0.8}
      weight={1.7} />;
    }

  function HeadingLineGreen({ position, heading }) {
      const length = 0.065; // You can tune this for visual size
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
  const [allShips, setAllShips] = useState([]); // ✅ Store all ships
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedGpsShip, setSelectedGpsShip] = useState(null);

  console.log(selectedGpsShip);

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

 useEffect(() => {
  const connectWebSocket = () => {
    console.log("Attempting WebSocket connection...");
    const wsUrl = "ws://13.209.33.15:4002";
    ws_Gps.current = new WebSocket(wsUrl);

    const startDataTimeout = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        console.warn("No data received within timeout. Clearing allShips.");
        setAllShips([]);
      }, 5000); // Adjust timeout duration as needed
    };

    ws_Gps.current.onopen = () => {
      console.log("WebSocket connected.");
      if (reconnectGpsInterval.current) {
        clearInterval(reconnectGpsInterval.current);
        reconnectGpsInterval.current = null;
      }
      startDataTimeout();
    };

    ws_Gps.current.onmessage = (event) => {
      startDataTimeout(); // Reset timeout on every message

      try {
        const message = JSON.parse(event.data);
        console.log(message);

        if (message.type === "shipsUpdate" && Array.isArray(message.ships)) {
          message.ships.forEach(ship => updateShipTargets(ship));

          setAllShips(prevShips => {
            return message.ships.map(newShip => {
              const existingShip = prevShips.find(s => s.device_id === newShip.device_id);

              if (existingShip) {
                return {
                  ...newShip,
                  heading: newShip.heading !== null ? newShip.heading : existingShip.heading,
                };
              } else {
                return newShip;
              }
            });
          });
        }
      } catch (err) {
        console.error("Error parsing WebSocket data:", err);
      }
    };

    ws_Gps.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws_Gps.current.onclose = () => {
      console.warn("WebSocket disconnected. Attempting reconnect...");
      if (!reconnectGpsInterval.current) {
        reconnectGpsInterval.current = setInterval(connectWebSocket, 5000);
      }
    };
  };

  connectWebSocket();

  return () => {
    if (ws_Gps.current) ws_Gps.current.close();
    if (reconnectGpsInterval.current) clearInterval(reconnectGpsInterval.current);
    clearTimeout(timeoutRef.current);
  };
}, []);
  
  console.log(allShips);

  const handleSelectedDrone = (systemID) => {
    const droneList = Object.values(drones); // convert to array
    const clickedDrone = droneList.find(drone => drone.system_id === systemID) || null;
    setSelectedDrone(clickedDrone);
  };

  const setShipByDeviceId = (deviceID) => {
    const shipList = allShips;
    const clickedship = shipList.find(ship => ship.device_id === deviceID) || null;
    setSelectedGpsShip(clickedship);
  };

  const [smoothPositions, setSmoothPositions] = useState({});
  const [smoothHeadings, setSmoothHeadings] = useState({});
  const animationFrameRefs = useRef({});
  const animationStartTimes = useRef({});
  const animationDuration = 1000; // 1 second animation duration

  function FollowSelectedDevice({ selectedDeviceId, smoothPositions }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedDeviceId) return;
    const smooth = smoothPositions[selectedDeviceId]?.smooth;
    if (!smooth) return;
    const [lat, lon] = smooth;
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [selectedDeviceId, smoothPositions]);

  return null;
}


  // Get current smooth position or fallback to raw
  const getSmoothPosition = (ship) => {
    const id = ship.device_id;
    return smoothPositions[id]?.smooth ?? [ship.gps_data?.[0]?.latitude ?? 0, ship.gps_data?.[0]?.longitude ?? 0];
  };
  // Get current smooth heading or fallback to raw
  const getSmoothHeading = (ship) => {
    const id = ship.device_id;
    return smoothHeadings[id]?.smooth ?? ship.heading ?? 0;
  };
  // Animate one ship per frame
  const animateShip = (id, now) => {
    if (!animationStartTimes.current[id]) animationStartTimes.current[id] = now;
    const elapsed = now - animationStartTimes.current[id];
    const t = Math.min(elapsed / animationDuration, 1); // clamp 0..1
    const pos = smoothPositions[id];
    if (!pos) return;
    // Interpolate lat/lon
    const lat = pos.prev[0] + (pos.target[0] - pos.prev[0]) * t;
    const lon = pos.prev[1] + (pos.target[1] - pos.prev[1]) * t;
    const head = smoothHeadings[id];
    if (!head) return;
    // Interpolate heading with angle wrapping
    const angleDiff = ((((head.target - head.prev) % 360) + 540) % 360) - 180;
    const interpHeading = head.prev + angleDiff * t;
    // Update smooth states
    setSmoothPositions(prev => ({
      ...prev,
      [id]: { ...prev[id], smooth: [lat, lon] }
    }));
    setSmoothHeadings(prev => ({
      ...prev,
      [id]: { ...prev[id], smooth: interpHeading }
    }));
    // Continue animation if not done
    if (t < 1) {
      animationFrameRefs.current[id] = requestAnimationFrame((timestamp) => animateShip(id, timestamp));
    }
  };
  // Called when new data arrives to start animation for each ship
  const updateShipTargets = (ship) => {
    const id = ship.device_id;
    const newPos = [ship.gps_data?.[0]?.latitude ?? 0, ship.gps_data?.[0]?.longitude ?? 0];
    const newHeading = ship.heading ?? 0;
    setSmoothPositions(prev => ({
      ...prev,
      [id]: {
        prev: prev[id]?.smooth ?? newPos,
        target: newPos,
        smooth: prev[id]?.smooth ?? newPos,
      }
    }));
    setSmoothHeadings(prev => ({
      ...prev,
      [id]: {
        prev: prev[id]?.smooth ?? newHeading,
        target: newHeading,
        smooth: prev[id]?.smooth ?? newHeading,
      }
    }));
    // Reset animation start time and cancel previous animation if any
    animationStartTimes.current[id] = performance.now();
    if (animationFrameRefs.current[id]) {
      cancelAnimationFrame(animationFrameRefs.current[id]);
    }
    animationFrameRefs.current[id] = requestAnimationFrame((timestamp) => animateShip(id, timestamp));
  };
  // Hook to update all ships when new data arrives (e.g. when allShips updates)
  useEffect(() => {
    if(allShips.length>0) allShips.forEach(ship => {
      updateShipTargets(ship);
    });
  }, [allShips]);  

  function SmoothMarker({ ship, carIcon, onClick, onMouseOver }) {
    const markerRef = useRef(null);
    useEffect(() => {
      if (markerRef.current) {
        const leafletMarker = markerRef.current;
        const pos = getSmoothPosition(ship); // your function returning smooth [lat, lon]
        const heading = getSmoothHeading(ship); // your function returning smooth heading
        leafletMarker.setLatLng(pos); // update position without re-render
        if (heading != null) {
          leafletMarker.setIcon(carIcon(heading)); // update icon without re-render
        }
      }
    }, [ship]); // run whenever smooth position or heading changes
    return (
      <Marker
        ref={markerRef}
        position={getSmoothPosition(ship)} // initial position
        icon={carIcon(getSmoothHeading(ship))}
        eventHandlers={{ click: onClick, mouseover: onMouseOver }}
      >
        <Popup>
          <strong>Heading:</strong> {ship.heading}
        </Popup>
      </Marker>
    );
  }

  return (
    <div className="w-full relative flex flex-col min-h-screen">
      <div className="absolute top-0 left-0 w-full bg-transparent z-40 flex flex-col gap-2 p-3">
        <TopBar />
      </div>

      {shipDetails && (
        <div className="absolute top-[60px] left-7 xl:w-[300px] lg:w-3/12 h-6/6 bg-white z-30 flex flex-col rounded-md shadow-md">
          <div className="w-full pt-1 pb-1 pl-3 pr-3 flex justify-between items-center bg-transparent shadow-md">
            <span className="font-semibold">Drone</span>
            <div className="flex justify-center items-center gap-2">
              <img src="video_icon.png" className="text-primary cursor-pointer object-contain size-5" onClick={() => setVideoView(true)}/>
              <RxCross2 size={"20px"} onClick={() => setShipDetails(!shipDetails)  
              } className="text-primary cursor-pointer" />
            </div>
            
          </div>

          <div className="w-full object-contain">
            <img src="droneImg.png" alt="Drone Image" className="w-full h-36" />
          </div>


          <div className="w-full flex pb-1 pl-3 flex-col">
            <div className="w-full flex items-end justify-start gap-1">
              <div className="flex justify-center items-center text-[16px] text-center font-semibold">Drone Info</div>
              <IoInformationCircle size={"20px"} className="text-gray-400" />
            </div>

          {droneRealTimeData.map((drone, index) => (
            <div className="w-full flex flex-wrap mt-2 border-b-0.5 text-[14px]" key={index}>
              {Object.entries(drone).map(([key, value]) => (
                <div className="w-1/2 flex flex-col mb-2" key={key}>
                  <div className="w-full flex items-center text-[12px] text-gray-500">{key}</div>
                  <div className="w-full flex items-center font-semibold text-primary">{value}</div>
                </div>
              ))}
            </div>
            ))}
          </div>
        </div>
      )}


    {/* GPS details */}
    {gpsDetails && (
      <>

        {selectedGpsShip !== null && (<div className="absolute top-[60px] left-7 xl:w-[300px] lg:w-3/12 h-6/6 bg-white z-40 flex flex-col rounded-md shadow-md">
          <div className="w-full pt-1 pb-1 pl-3 pr-3 flex justify-between items-center bg-transparent shadow-md">
            <span className="font-semibold">GPS details</span>
            <div className="flex justify-center items-center gap-2">
              <RxCross2 size={"20px"} onClick={() => {setGpsDetails(!gpsDetails);
                setSelectedDeviceId(null); setShipDetails(false); setSelectedGpsShip(null);
              }} className="text-primary cursor-pointer" />
            </div>
            
          </div>

          <div className="w-full object-contain">
            <img src="car_Hijet.png" alt="Car Image" className="w-full h-44" />
          </div>

          <div className="w-full flex justify-between items-center pb-1 pl-1 mt-2 text-[9.5px] font-bold">
            <div className="w-7/12 bg-primary text-white rounded-md p-1 items-center flex justify-between">DeviceID:<span className="ml-1 text-[9px] p-1 bg-white text-primary rounded-sm">{selectedGpsShip.device_id}</span></div>
            <div className="w-4/12 bg-red-500 text-white rounded-md p-1 items-center flex justify-between">Heading: <span className=" text-[9px] p-1 bg-white text-red-500 rounded-sm">{selectedGpsShip.heading}°</span></div>
            <div></div>
          </div>

          <div className="w-full flex pb-1 pl-3 flex-col">
            <div className="w-full flex items-center justify-start gap-1 mt-2">
              <div className="flex justify-center items-center text-[16px] text-center font-semibold text-red-500">Top GPS</div>
              <IoInformationCircle size={"20px"} className="text-gray-400" />
            </div>
            <div className="w-full flex flex-wrap mt-2 border-b-0.5 text-[14px]">
            {selectedGpsShip &&
                Object.entries(selectedGpsShip.gps_data[0]).map(([key, value]) => (
                  <div className="w-1/2 flex flex-col mb-1" key={key}>
                    <div className="w-full flex items-center text-[12px] text-gray-500">
                      {key}
                    </div>
                    <div className="w-full flex items-center font-semibold text-red-500">
                      {Array.isArray(value) ? value.join(", ") : value?.toString()}
                    </div>
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
            {selectedGpsShip &&
                Object.entries(selectedGpsShip.gps_data[1]).map(([key, value]) => (
                  <div className="w-1/2 flex flex-col mb-1" key={key}>
                    <div className="w-full flex items-center text-[12px] text-gray-500">
                      {key}
                    </div>
                    <div className="w-full flex items-center font-semibold text-red-500">
                      {Array.isArray(value) ? value.join(", ") : value?.toString()}
                    </div>
                  </div>
                ))}
            </div>
        </div>
        </div>)}
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
                  eventHandlers={{ click: () => {setShipDetails(true);
                  },
                  mouseover: () => {setSystemID(drone.system_id); handleSelectedDrone(drone.system_id); setGpsDetails(false)
                                                 setShipDetails(true); setSelectedDeviceId(null);},
                  }}
                >
                <HeadingLine position={[drone.lat, drone.lon]} heading={drone.heading} />
                <HeadingLineOrange position={[drone.lat, drone.lon]} heading={drone.previous_heading / 100} />
                <HeadingLineGreen position={[drone.lat, drone.lon]} heading={drone.target_heading} />
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
                  color="black"
                  opacity={0.5}
                  weight={2}
                  dashArray="5, 10"
                />
              </>
              ))}
              {allShips.length > 0 && allShips.map((ship, index) =>  (
                  <SmoothMarker
                  key={index}
                  ship={ship}
                  carIcon={carIcon}
                  onClick={() => {
                    setGpsDetails(true);
                    setSelectedDeviceId(ship.device_id);
                  }}
                  onMouseOver={() => {setSelectedDeviceId(ship.device_id);
                    setGpsDetails(true);
                    setShipByDeviceId(ship.device_id)
                  }}
                />
                ))}
              <FollowSelectedDevice
                selectedDeviceId={selectedDeviceId}
                smoothPositions={smoothPositions}
              />
            </MapContainer>
      </div>

      {videoView && <FlightMapDetails videoView={videoView} setVideoView={setVideoView} systemID={systemID}/>}

    </div>
  );
};

export default RealTimeInfo;
