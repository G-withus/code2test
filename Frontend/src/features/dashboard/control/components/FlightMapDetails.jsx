import { useState, useRef, useEffect, useMemo } from "react";
import { RxCross2 } from "react-icons/rx";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// import * as turf from "@turf/turf";
// import useTranslations from "../../../../components/Language";


// eslint-disable-next-line react/prop-types
const VideoViewer = ({setVideoView, systemID}) => {
   

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

    function FollowDrone({ lat, lon }) {
      const map = useMap();
    
      useEffect(() => {
        if (smoothPosition) {
          map.setView(smoothPosition, map.getZoom()); // keep zoom level
        }
      }, [smoothPosition, map]);
    
      return null;
    }

     const [status, setStatus] = useState("Initializing...");
    const [error, setError] = useState(null);

    const janusRef = useRef(null);
    const pluginRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteVideoRef2 = useRef(null);
    const streamRef = useRef(null);

    const mid = "v" + systemID.toString().padStart(3, "0");
    const server = "ws://3.39.219.71:8188"; // Janus WebSocket Server
    const streamId = 1234;
    const secret = "adminpwd";

    const videoRefs = [useRef(null), useRef(null)];
    const isDragging = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });
    const [drones, setDrones] = useState({});
    const [shipPosition, setShipPosition] = useState(null);
    const reconnectInterval = useRef(null);
    const [wayPointsVisible, setWayPointsVisible] = useState(false);
    const [detectedCount, setDetectedCount] = useState(0);
    const [prevPosition, setPrevPosition] = useState([0,0]);
    const [targetPosition, setTargetPosition] = useState([0,0]);
    const [smoothPosition, setSmoothPosition] = useState([0,0]);

    const [prevHeading, setPrevHeading] = useState(0);
    const [targetHeading, setTargetHeading] = useState(0);
    const [smoothHeading, setSmoothHeading] = useState(0);

    const [prevPrevHeading, setPrevPrevHeading] = useState(0);
    const [prevTargetHeading, setPrevTargetHeading] = useState(0);
    const [prevSmoothHeading, setPrevSmoothHeading] = useState(0);

    const [targetSmoothHeading, setTargetSmoothHeading] = useState(0);
    const [targetPreviousHeading, setTargetPreviousHeading] = useState(0);
    const [targetTargetHeading, setTargetTargetHeading] = useState(0);


    const duration = 1000; // match your WebSocket update interval
    const startTimeRef = useRef(null);
    // const t = useTranslations();
    // console.log(systemID);
    // console.log(drones)
    // console.log(shipPosition)
    const droneData = [
        {
          "Drone_ID": `VT${String(drones.system_id).padStart(3, '0')} / ${drones.system_id}`,
          "Vessel ID": "??",
          "Latitude": drones.lat != null ? (drones.lat).toFixed(4) + "° " + (drones.lat >= 0 ? "N" : "S"): null,
          "Longitude": drones.lon != null ? (drones.lon).toFixed(4)  + "° " + (drones.lon >= 0 ? "E" : "W"): null,
          "alt": drones.alt,
          "dist_traveled(m)": drones.dist_traveled != null ? `${Math.floor(drones.dist_traveled)} m` : null,
          "wp_dist(m)": drones.wp_dist,
          "dist_to_home(m)": drones.dist_to_home != null ? drones.dist_to_home.toString().replace('.', '').slice(0, 4): null,
          "wind_vel(m/s)": drones.wind_vel != null ? drones.wind_vel.toFixed(2) : null,
          "airspeed(m/s)": drones.airspeed != null ? drones.airspeed.toFixed(2) : null,
          "groundspeed(m/s)": drones.ground_speed != null ? drones.ground_speed.toFixed(2) : null,
          "roll": drones.roll,
          "pitch": drones.pitch,
          "yaw": drones.yaw,
          "toh": drones.toh,
          "tot": drones.tot,
          "time_in_air(s)": drones.time_in_air,
          "time_in_air_min_sec": drones.time_in_air != null ? `${String(Math.floor(drones.time_in_air / 3600)).padStart(2, '0')}h ` + `${String(Math.floor((drones.time_in_air % 3600) / 60)).padStart(2, '0')}m ` + `${String(drones.time_in_air % 60).padStart(2, '0')}s`: null,
          "gps_hdop": drones.gps_hdop,
          "battery_voltage(V)": drones.battery_voltage != null ? ((drones.battery_voltage)/1000).toFixed(2) : null,
          "battery_current(A)": drones.battery_current != null ? ((drones.battery_current)/100).toFixed(2) : null,
          "ch3percent": drones.ch3percent+"%",
          "ch3out": drones.ch3out,
          "ch9out": drones.ch9out,
          "ch10out": drones.ch10out,
          "ch11out": drones.ch11out,
          "ch12out": drones.ch12out,
          "Flight_Time" : drones.auto_time != null ? `${String(Math.floor(drones.auto_time / 3600)).padStart(2, '0')}h ` + `${String(Math.floor((drones.auto_time % 3600) / 60)).padStart(2, '0')}m ` + `${String(drones.auto_time % 60).padStart(2, '0')}s`: null,
        }
      ];
      // Janus WebRTC Stream
  useEffect(() => {
    const adapterScript = document.createElement("script");
    adapterScript.src = "/adapter-latest.js";
    adapterScript.onload = () => {
      const janusScript = document.createElement("script");
      janusScript.src = "/janus.js";
      janusScript.onload = initializeJanus;
      document.body.appendChild(janusScript);
    };
    document.body.appendChild(adapterScript);

    return () => {
      if (janusRef.current) janusRef.current.destroy();
      document.body.removeChild(adapterScript);
    };
  }, [systemID]);

  const initializeJanus = () => {
    window.Janus.init({
      debug: "warn",
      callback: () => {
        if (!window.Janus.isWebrtcSupported()) {
          setError("WebRTC not supported by this browser.");
          return;
        }

        janusRef.current = new window.Janus({
          server,
          success: () => attachPlugin(),
          error: (err) => setError(`Janus error: ${err}`),
        });
      },
    });
  };

  const attachPlugin = () => {
    janusRef.current.attach({
      plugin: "janus.plugin.streaming",
      opaqueId: `stream-${mid}-${window.Janus.randomString(8)}`,
      success: (handle) => {
        pluginRef.current = handle;
        setStatus(`Attached. Watching drone ${systemID} (mid=${mid})`);
        handle.send({
          message: {
            request: "watch",
            id: systemID+1000,
            mid: mid,
            secret,
            offer_audio: false,
            offer_video: true,
          },
        });
      },
      error: (err) => setError(`Plugin attach failed: ${err}`),
      onmessage: (msg, jsep) => {
        if (msg.error) {
          setError(msg.error);
          return;
        }
        if (jsep) {
          pluginRef.current.createAnswer({
            jsep,
            tracks: [{ type: "video", mid: mid, recv: true }],
            success: (jsepAnswer) => {
              pluginRef.current.send({
                message: { request: "start" },
                jsep: jsepAnswer,
              });
            },
            error: (err) => setError(`WebRTC answer error: ${err}`),
          });
        }
      },
      onremotetrack: (track, incomingMid, on) => {
        if (incomingMid !== mid) return;

        if (!streamRef.current) {
          streamRef.current = new MediaStream();
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = streamRef.current;
          if (remoteVideoRef2.current) remoteVideoRef2.current.srcObject = streamRef.current;
        }

        if (on) {
          streamRef.current.addTrack(track);
        } else {
          streamRef.current.removeTrack(track);
        }
      },
      oncleanup: () => {
        setStatus("Stream stopped.");
        streamRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (remoteVideoRef2.current) remoteVideoRef2.current.srcObject = null;
      },
    });
  };

  // useEffect(() => {
  //   const socket = io('http://192.168.72.132:5000',{
  //           query:{
  //               user:'dest',
  //               did:'drone_01',
  //           }
  //       });

  //   socket.on('connect', () => {
  //     console.log('Connected to server');
  //   });

  //   socket.on('server_response', (data) => {
  //     if (data?.status && data?.detections) {
  //       console.log('Received detections:', data.detections);
  //       setDetections(data.detections);
  //     }
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);
      
    
      const ws = useRef(null);

      useEffect(() => {
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
            try {
              const data = JSON.parse(event.data);
              if (data.drones && Array.isArray(data.drones)) {

                const selectedDrone = data.drones.find((drone) => drone.system_id === systemID) || null;

                setDrones(selectedDrone);
                if (selectedDrone) {
                  setDrones(selectedDrone);

                  // Only store first lat/lon once
                  setShipPosition((prev) => {
                    if (prev === null) {
                      return {
                        lat: selectedDrone.lat,
                        lon: selectedDrone.lon,
                        system_id: selectedDrone.system_id,
                      };
                    }
                    return prev; // Already stored
                  });
                }
              } else {
                console.warn("Invalid WebSocket data:", data);
              }
            } catch (error) {
              console.error("Error parsing WebSocket data:", error);
            }
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
        };
      }, []);

        useEffect(() => {
    let animationFrame;
  
    const animate = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1); // clamp to [0, 1]
  
      // Linear interpolation for position
      const lat = prevPosition[0] + (targetPosition[0] - prevPosition[0]) * t;
      const lon = prevPosition[1] + (targetPosition[1] - prevPosition[1]) * t;
      setSmoothPosition([lat, lon]);
  
      // Linear interpolation for heading
      const angleDiff = ((((targetHeading - prevHeading) % 360) + 540) % 360) - 180;
      const anglePrev = ((((prevTargetHeading - prevPrevHeading) % 360) + 540) % 360) - 180;
      const angleTarget = ((((targetTargetHeading - targetPreviousHeading) % 360) + 540) % 360) - 180;
      const interpolatedHeading = prevHeading + angleDiff * t;
      const interpolatedPrevHeading = prevPrevHeading + anglePrev * t;
      const interpolatedTargetHeading = targetPreviousHeading + angleTarget * t;
      setSmoothHeading(interpolatedHeading);
      setPrevSmoothHeading(interpolatedPrevHeading);
      setTargetSmoothHeading(interpolatedTargetHeading);
  
      if (t < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
  
    animationFrame = requestAnimationFrame(animate);
  
    return () => cancelAnimationFrame(animationFrame);
  }, [prevPosition, targetPosition, prevHeading, targetHeading, prevPrevHeading, prevTargetHeading, targetPreviousHeading, targetTargetHeading]);

  useEffect(() => {
      setPrevPosition(smoothPosition);
      setPrevHeading(smoothHeading);
      setPrevPrevHeading(prevSmoothHeading);
      setTargetPreviousHeading(targetSmoothHeading);

      if (drones.lat != null && drones.lon != null) {
        setTargetPosition([drones.lat, drones.lon]);
      }
      if (drones.heading != null && drones.previous_heading != null && drones.target_heading != null) {
        setTargetHeading(drones.heading);
        setPrevTargetHeading(drones.previous_heading / 100);
        setTargetTargetHeading(drones.target_heading);
      }
    
      startTimeRef.current = performance.now();
    }, [drones.lat, drones.lon, drones.heading]);
  
      

      // Custom Drone Icon
      const droneIcon = (rotation) =>
        new L.DivIcon({
          className: "custom-drone-icon",
          html: `<div style="transform: rotate(${rotation}deg);"><img src="droneIcon.png" width="25" height="25"/></div>`,
          iconSize: [25, 25],
          iconAnchor: [12, 12],
        });
      

   const [formattedTime, setFormattedTime] = useState("");
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const pad = (n) => n.toString().padStart(2, "0");
        const year = pad((date.getFullYear() % 100)+2000);
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
    };
  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(formatTimestamp(Date.now()));
    }, 1000); // update every second
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

    return (
        <div className="w-full h-full absolute z-50 flex flex-col top-0 left-0 font-pretendard bg-white text-white p-0">
            {/* Header */}
            <div className="w-full flex justify-between items-center pt-2 pb-2 pl-4 pr-4 bg-primary bg-opacity-70">
                <div className="w-1 h-1 rounded-full bg-[#4ECC00]"></div>
                <div className="text-sm ">
                   Live Flight Video ({formattedTime})
                </div>
                <RxCross2 onClick={() => setVideoView(false)} className="cursor-pointer" />
            </div>

            {/* Video Container */}
            <div className="w-full flex items-center dasktop:h-2/5 laptop:h-1/2 bg-white">
                {/* Video 1 */}
                <div
                    className="w-1/2 h-full overflow-hidden flex justify-center items-center"
                >
                    <video
                        ref={remoteVideoRef}
                        autoPlay 
                        muted
                        controls
                        playsInline 
                        className="cursor-grab w-full h-full object-fill"
                        
                    ></video>  
                </div>

               {/** Telemetric data */}
               <div className="w-1/2 h-full p-2 flex flex-col gap-2 text-black">
                    <div className="w-full flex justify-center items-center p-2 bg-primary text-white text-sm font-semibold border-b-2 border-b-primary">Flight Info</div>
                    
                    <div className="w-full flex flex-wrap mr-2 justify-start items-center text-sm">
                    {droneData && droneData?.length > 0 ? (
                        Object.entries(droneData[0]).map(([key, value]) => (
                            <div key={key} className="w-1/3 flex items-center p-[8px] justify-between border-b-0.5 text-xs">
                                <div className="font-semibold text-gray-500">{key}:</div>
                                <div className="overflow-scroll text-primary font-bold">{value}</div>
                            </div>
                        ))
                        ) : (
                            <div>No drone data available</div>
                    )}
                    </div>
                </div>
               
            </div>

            {/*map */}
            <div className="w-full flex items-center dasktop:h-3/5 laptop:h-1/2">
                
                {/* Map */}
      {drones && Object.keys(drones).length > 0 && (<MapContainer
            center={[drones.lat, drones.lon]}
            zoom={18}
            minZoom={2.5}
            maxZoom={18} 
            className="z-0 w-full h-full"
            zoomControl={false}
            attributionControl={false}
            maxBounds={[[-85, -180], [85, 180]]} // limits panning to a single world map
            maxBoundsViscosity={1.0} 
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap={true}/>
              {drones && Object.keys(drones).length > 0 && (
                <>
                <Marker
                  key={drones.system_id}
                  position={smoothPosition}
                  icon={droneIcon(smoothHeading)}
                >
                </Marker>
                <FollowDrone lat={drones.lat} lon={drones.lon} />
                <HeadingLine position={smoothPosition} heading={smoothHeading} />
                <HeadingLineOrange position={smoothPosition} heading={prevSmoothHeading} />
                <HeadingLineGreen position={smoothPosition} heading={targetSmoothHeading} />
                
                <Polyline
                  key={drones.GCS_IP}
                  positions={Array.isArray(drones.waypoints) ? drones.waypoints.map((waypoint) => [waypoint.lat, waypoint.lon]) : []}
                  color="black"
                  opacity={0.5}
                  weight={2}
                  dashArray="5, 5"
                  smoothFactor={1}
                />
              </>
              )}
        {wayPointsVisible &&<Polyline positions={drones.waypoints} color="#111111" opacity={0.5} weight={2} dashArray="5, 10"/>}
        
      </MapContainer>)}

            </div>

        </div>
    );
};

export default VideoViewer;
