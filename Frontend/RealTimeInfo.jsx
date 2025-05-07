import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TopBar from "../../components/TopBar";
import { RxCross2 } from "react-icons/rx";
import { IoInformationCircle } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import FlightMapDetails from "./FlightMapDetails";
import { IoMdSearch } from "react-icons/io";
import useTranslations from "../../../../components/Language";

const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(map.getContainer());
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
};

const droneIcon = (rotation) =>
  new L.DivIcon({
    className: "custom-drone-icon",
    html: `<div style="transform: rotate(${rotation}deg);"><img src="droneIcon.png" width="25" height="25"/></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });

const shipIcon = new L.Icon({
  iconUrl: "shipIcon.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const data = {
  ships: [
    { id: "ship1", position: [35.0767275, 129.0920452] },
    { id: "ship2", position: [35.0807275, 129.0960452, 0] },
    { id: "ship3", position: [35.0797275, 129.0950452, 0] },
  ],
  drones: [
    {
      id: "drone1",
      position: [35.0767275, 129.0920452],
      waypoints: [
        [35.0767275, 129.0920452],
        [35.074127, 129.092103],
        [35.068399, 129.089666],
        [35.067036, 129.087389],
        [35.066579, 129.086606],
        [35.067136, 129.086013],
        [35.074309, 129.091761],
        [35.0767372, 129.0920443],
      ],
    },
    {
      id: "drone2",
      position: [35.0767275, 129.0920452],
      waypoints: [
        [35.0767275, 129.0920452],  
        [35.0778, 129.0925],  
        [35.0760, 129.0935],  
        [35.0742, 129.0928],  
        [35.0730, 129.0910],  
        [35.0735, 129.0892],  
        [35.0755, 129.0880],  
        [35.0772, 129.0888],  
        [35.0767275, 129.0920452]
      ],
    },
    {
      id: "drone3",
      position: [35.0767275, 129.0920452],
      waypoints: [
        [35.0767275, 129.0920452],  
        [35.0760, 129.0955],  
        [35.0745, 129.0962],  
        [35.0730, 129.0955],  
        [35.0720, 129.0940],  
        [35.0725, 129.0925],  
        [35.0740, 129.0915],  
        [35.0755, 129.0925],  
        [35.0767275, 129.0920452]
      ],
    },
  ],
};

const RealTimeInfo = () => {
  const [ships, setShips] = useState([]);
  const [drones, setDrones] = useState([]);
  const [droneStates, setDroneStates] = useState(
    data.drones.reduce((acc, drone) => {
      acc[drone.id] = {
        position: drone.position,
        rotation: 0,
        index: 0,
      };
      return acc;
    }, {})
  );
  const intervalRefs = useRef({});
  const animationActiveRefs = useRef({});

  
const [videoView, setVideoView] = useState(false);
  const [shipDetails, setShipDetails] = useState(false);
  const [wayPointsVisible, setWayPointsVisible] = useState(false);
  const searchRef = useRef(null);
  const t = useTranslations();

  useEffect(() => {
    setShips(data.ships);
    setDrones(data.drones);
  }, []);

  const moveDrone = (droneId, waypoints, startIndex = 0) => {
    if (animationActiveRefs.current[droneId]) return;

    animationActiveRefs.current[droneId] = true;
    let currentIndex = startIndex;

    const moveToNextWaypoint = () => {
      if (currentIndex >= waypoints.length - 1) {
        animationActiveRefs.current[droneId] = false;
        return;
      }

      const current = waypoints[currentIndex];
      const next = waypoints[currentIndex + 1];

      const dx = next[1] - current[1];
      const dy = next[0] - current[0];
      let angle = Math.atan2(dx, dy) * (180 / Math.PI);
      angle = (angle + 360) % 360;

      let step = 0;
      const steps = 400;
      const latStep = (next[0] - current[0]) / steps;
      const lngStep = (next[1] - current[1]) / steps;

      intervalRefs.current[droneId] = setInterval(() => {
        if (step < steps) {
          step++;
          setDroneStates((prev) => ({
            ...prev,
            [droneId]: {
              ...prev[droneId],
              position: [
                current[0] + latStep * step,
                current[1] + lngStep * step,
              ],
              rotation: angle,
            },
          }));
        } else {
          clearInterval(intervalRefs.current[droneId]);
          currentIndex++;
          moveToNextWaypoint();
        }
      }, 50);
    };

    moveToNextWaypoint();
  };

  useEffect(() => {
    drones.forEach((drone) => {
      moveDrone(drone.id, drone.waypoints);
    });

    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, [drones]);

  const handleSearchFocus = () => {
    searchRef.current.focus();
  };

  const shipData = [
    {
      Vessel: "Serena Ver.2",
      [t.captain]: "name",
      [t.country]: "KOREA",
      Mate: "name",
      IMO: "MDT-V290",
      "Call Sign": "SXZB",
      MMSI: "MDT-V290",
      Yield: "300t",
      Latitude: "35.30054 N",
      Longitude: "148.40883 S",
    },
  ];

  const droneData = [
    {
      Model: "MDT-V290",
      "Serial No": "name",
      "Drone ID": "123DFSEW34",
      "Call Sign": "SXZB",
    },
    {
      Model: "MDT-V290",
      "Serial No": "name",
      "Drone ID": "456GHJK89",
      "Call Sign": "SXZB",
    },
  ];

  return (
    <div className="w-full relative flex flex-col min-h-screen">
      <div className="absolute top-0 left-0 w-full bg-transparent z-40 flex flex-col gap-2 p-3">
        <TopBar />
      </div>

      {shipDetails && (
        <div className="absolute top-[70px] left-7 w-1/5 h-5/6 bg-white z-40 flex flex-col rounded-md shadow-md overflow-y-scroll no-scrollbar cursor-grabbing">
          {/* Ship Name */}
          <div className="w-full pt-1 pb-1 pl-3 pr-3 flex justify-between items-center bg-transparent shadow-md">
            <span className="font-semibold">Serena ver.2</span>
            <RxCross2 onClick={() => setShipDetails(!shipDetails)} className="cursor-pointer" />
          </div>

          {/* Ship Image */}
          <div className="w-full object-contain">
            <img src="shipImage_example.jpg" alt="Ship Image" className="w-full h-36" />
          </div>

          {/* Vessels Info */}
          <div className="w-full flex pt-1 pb-1 pl-3 flex-col">
            <div className="w-full flex items-end justify-start gap-1">
              <div className="flex justify-center items-center text-[16px] text-center font-semibold">Vessels Info</div>
              <IoInformationCircle size={"20px"} className="text-gray-400" />
            </div>
            <div className="w-full flex flex-wrap mt-2 border-b-0.5 text-[14px]">
              {Object.entries(shipData[0]).map(([key, value]) => (
                <div className="w-1/2 flex flex-col mb-2" key={key}>
                  <div className="w-full flex items-center text-[12px] text-gray-500">{key}</div>
                  <div className="w-full flex items-center font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Drone Info */}
          <div className="w-full flex pt-1 pb-1 pl-3 flex-col">
            <div className="w-full flex items-end justify-start gap-1">
              <div className="flex justify-center items-center text-[16px] text-center font-semibold">Drone Info</div>
              <IoInformationCircle size={"20px"} className="text-gray-400" />
            </div>
            <div className="w-full flex flex-wrap mt-2 border-b-0.5 text-[14px]">
              {Object.entries(droneData[0]).map(([key, value]) => (
                <div className="w-1/2 flex flex-col mb-2" key={key}>
                  <div className="w-full flex items-center text-[12px] text-gray-500">{key}</div>
                  <div className="w-full flex items-center font-semibold">{value}</div>
                </div>
              ))}
              {Object.entries(droneData[1]).map(([key, value]) => (
                <div className="w-1/2 flex flex-col mb-2" key={key}>
                  <div className="w-full flex items-center text-[12px] text-gray-500">{key}</div>
                  <div className="w-full flex items-center font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pilot Info */}
          <div className="w-full flex pt-1 pb-1 pl-3 flex-col">
            <div className="w-full flex items-end justify-start gap-1">
              <div className="flex justify-center items-center text-[16px] text-center font-semibold">Pilot Info</div>
            </div>
            <div className="w-full flex flex-col flex-wrap mt-2 text-[14px]">
              <div className="w-full flex mb-2">
                <div className="w-1/2 flex items-center text-[12px] text-gray-500">Internal pilot</div>
                <div className="w-1/2 flex justify-center items-center font-semibold gap-1">
                  <img src="dronePilotExample.jpg" alt="Pilot Image" className="w-7 h-7 rounded-full object-contain border-0.5" />
                  <span className="font-semibold">name</span>
                  <IoInformationCircle size={"15px"} className="text-gray-400" />
                </div>
              </div>
              <div className="w-full flex mb-2">
                <div className="w-1/2 flex items-center text-[12px] text-gray-500">Outside pilot</div>
                <div className="w-1/2 flex justify-center items-center font-semibold gap-1">
                  <img src="dronePilotExample.jpg" alt="Pilot Image" className="w-7 h-7 rounded-full object-contain border-0.5" />
                  <span className="font-semibold">name</span>
                  <IoInformationCircle size={"15px"} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Video and WayPoint buttons */}
          <div className="w-full flex pt-1 pb-1 pl-3 pr-3 gap-2 mt-3 mb-3">
            <button
              className="flex justify-center items-center w-1/2 bg-[#3B5BDC] bg-opacity-[8%] text-white rounded-md pl-4 pr-4 pt-2 pb-2 gap-3"
              onClick={() => setVideoView(true)}
            >
              <img src="videoIcon.png" alt="" className="w-6 h-6" />
              <span className="text-primary font-semibold">{t.video}</span>
            </button>
            <button
              className="flex justify-center items-center w-1/2 bg-[#3B5BDC] bg-opacity-[8%] text-white rounded-md pl-4 pr-4 pt-2 pb-2 gap-3"
              onClick={() => setWayPointsVisible(!wayPointsVisible)}
            >
              <img src="compassIcon.png" alt="" className="w-6 h-6" />
              <span className="text-primary font-semibold">{t.wayPoints}</span>
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-[70px] right-3 w-[370px] bg-white z-40 flex justify-between items-center rounded-md shadow-lg pl-1 pt-1 pb-1">
        <input type="text" placeholder={t.quickSearch} className="p-2 rounded-sm bg-transparent text-sm w-5/6" ref={searchRef} />
        <IoMdSearch className="w-1/6 text-2xl text-[#767676] cursor-pointer" onClick={handleSearchFocus} />
      </div>

      <div className="w-full flex-1 relative">
        <MapContainer
          center={[35.0777275, 129.0930452]} // Centered between ships
          zoom={16}
          className="z-0 w-full h-full"
          zoomControl={false}
          trackResize={true}
        >
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapResizeHandler />
          {ships.map((ship) => (
            <Marker
              key={ship.id}
              position={[ship.position[0], ship.position[1], 0].slice(0, 2)} // 2D position
              icon={shipIcon}
              eventHandlers={{ click: () => setShipDetails(true) }}
            />
          ))}
          {drones.map((drone) => {
            const state = droneStates[drone.id];
            return (
              <Marker
                key={drone.id}
                position={[state.position[0], state.position[1]]}
                icon={droneIcon(state.rotation)}
                eventHandlers={{
                  mouseover: (e) => e.target.openPopup(),
                  mouseout: (e) => e.target.closePopup(),
                  click: () => setWayPointsVisible(!wayPointsVisible),
                }}
              >
                <Popup>{`ID: ${drone.id} (Alt: ${state.position[2] || 0}m)`}</Popup>
              </Marker>
            );
          })}
          {wayPointsVisible &&
            drones.map((drone) => {
              
              return (
                <Polyline
                  key={drone.id}
                  positions={drone.waypoints.map(([lat, lng]) => [lat, lng])}
                  color={drone.id === "drone1" ? "#111111" : "#FF0000"}
                  opacity={0.5}
                  weight={2}
                  dashArray="5, 10"
                />
              );
            })}
        </MapContainer>
      </div>

      {videoView && <FlightMapDetails videoView={videoView} setVideoView={setVideoView} />}
    </div>
  );
};

export default RealTimeInfo;

