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

    // State for each video's zoom and position
    const [video1State, setVideo1State] = useState({ scale: 1, x: 0, y: 0 });
    const [video2State, setVideo2State] = useState({ scale: 1, x: 0, y: 0 });
   
        const remoteVideoRef = useRef(null);
    const remoteVideoRef2 = useRef(null);
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState('');
    const janusRef = useRef(null);
    const streamingRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const server = "ws://3.37.36.190:8188"; // Janus WebSocket Server
    const streamId = 1234;
    const secret = "adminpwd";
    const mountpointName = "Drone Video Stream";
    console.log(remoteVideoRef.current);
    const videoRefs = [useRef(null), useRef(null)];
    const isDragging = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });
    const [drones, setDrones] = useState({});
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");
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
    adapterScript.onload = loadJanus;
    document.body.appendChild(adapterScript);
    function loadJanus() {
      const janusScript = document.createElement("script");
      janusScript.src = "/janus.js";
      janusScript.onload = initializeJanus;
      document.body.appendChild(janusScript);
    }
    function initializeJanus() {
      window.Janus.init({
        debug: "warn",
        callback: function () {
          if (!window.Janus.isWebrtcSupported()) {
            setError("WebRTC not supported by this browser");
            return;
          }
          janusRef.current = new window.Janus({
            server: server,
            success: function () {
              setStatus("Connected to Janus server");
              attachToStreamingPlugin();
            },
            error: function (err) {
              setError(`Connection failed: ${err}`);
            },
          });
        },
      });
    }
    function attachToStreamingPlugin() {
      janusRef.current.attach({
        plugin: "janus.plugin.streaming",
        opaqueId: `streaming-${streamId}-${window.Janus.randomString(12)}`,
        success: function (pluginHandle) {
          streamingRef.current = pluginHandle;
          setStatus(`Connected to ${mountpointName}`);
          startWatching();
        },
        error: function (error) {
          setError(`Plugin error: ${error}`);
        },
        onmessage: function (msg, jsep) {
          if (msg.error) {
            setError(msg.error);
            return;
          }
          if (msg.result && msg.result.status) {
            setStatus(`Stream status: ${msg.result.status}`);
          }
          if (jsep) {
            streamingRef.current.createAnswer({
              jsep: jsep,
              tracks: [{ type: "video", recv: true }],
              success: function (jsepAnswer) {
                streamingRef.current.send({
                  message: { request: "start" },
                  jsep: jsepAnswer,
                });
              },
              error: function (error) {
                setError(`WebRTC error: ${error}`);
              },
            });
          }
        },
        onremotetrack: function (track, mid, on) {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStreamRef.current;
            }
          }
          if (on) {
            remoteStreamRef.current.addTrack(track);
            setStatus(`Stream ${mid} playing`);
          } else {
            remoteStreamRef.current.removeTrack(track);
          }
        },
        oncleanup: function () {
          setStatus("Stream disconnected");
          remoteStreamRef.current = null;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        },
      });
    }
    function startWatching() {
      streamingRef.current.send({
        message: {
          request: "watch",
          id: streamId,
          secret: secret,
          offer_audio: false,
          offer_video: true,
        },
        success: function () {
          setStatus("Requesting stream...");
        },
        error: function (error) {
          setError(`Watch error: ${error}`);
        },
      });
    }
    return () => {
      if (janusRef.current) {
        janusRef.current.destroy();
      }
      document.body.removeChild(adapterScript);
    };
  }, [systemID]);
      
    
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
      

    // Handle zoom for each video
    const handleWheelZoom = (event, videoIndex) => {
        event.preventDefault();
        const zoomFactor = 0.1;
        const maxScale = 3;
        const minScale = 1;

        if (videoIndex === 0) {
            setVideo1State((prev) => {
                const newScale = event.deltaY < 0 ? prev.scale + zoomFactor : prev.scale - zoomFactor;
                return { ...prev, scale: Math.max(minScale, Math.min(newScale, maxScale)) };
            });
        } else {
            setVideo2State((prev) => {
                const newScale = event.deltaY < 0 ? prev.scale + zoomFactor : prev.scale - zoomFactor;
                return { ...prev, scale: Math.max(minScale, Math.min(newScale, maxScale)) };
            });
        }
    };

    // Handle dragging (pan) for each video when zoomed in
    const handleMouseDown = (event, videoIndex) => {
        if ((videoIndex === 0 && video1State.scale > 1) || (videoIndex === 1 && video2State.scale > 1)) {
            isDragging.current = { videoIndex, active: true };
            lastPosition.current = { x: event.clientX, y: event.clientY };
        }
    };

    const handleMouseMove = (event) => {
        if (isDragging.current?.active) {
            const videoIndex = isDragging.current.videoIndex;
            const dx = event.clientX - lastPosition.current.x;
            const dy = event.clientY - lastPosition.current.y;

            if (videoIndex === 0) {
                setVideo1State((prev) => ({
                    ...prev,
                    x: prev.x + dx,
                    y: prev.y + dy,
                }));
            } else {
                setVideo2State((prev) => ({
                    ...prev,
                    x: prev.x + dx,
                    y: prev.y + dy,
                }));
            }

            lastPosition.current = { x: event.clientX, y: event.clientY };
        }
    };

    const handleMouseUp = () => {
        isDragging.current = { videoIndex: null, active: false };
    };

    // Reset zoom for a specific video
    const resetZoom = (videoIndex) => {
        if (videoIndex === 0) {
            setVideo1State({ scale: 1, x: 0, y: 0 });
        } else {
            setVideo2State({ scale: 1, x: 0, y: 0 });
        }
    };

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
            <div className="w-full flex items-center h-2/5 bg-white">
                {/* Video 1 */}
                <div
                    className="w-1/2 h-full overflow-hidden flex justify-center items-center"
                    onWheel={(e) => handleWheelZoom(e, 0)}
                    onMouseDown={(e) => handleMouseDown(e, 0)}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onDoubleClick={() => resetZoom(0)}
                >
                    <video
                        ref={remoteVideoRef}
                        autoPlay 
                        muted
                        controls
                        playsInline 
                        className="cursor-grab w-full h-full object-fill"
                        style={{
                            transform: `scale(${video1State.scale}) translate(${video1State.x}px, ${video1State.y}px)`,
                            transition: "transform 0.1s ease-out",
                        }}
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

            {/* Telemetric data and map */}
            <div className="w-full flex items-center h-3/5">
                
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