import { useEffect, useState } from "react";
import io from "socket.io-client";

interface Device {
  id: string;
  name: string;
}

const Home = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {

    const socket = io({ path: "/api/socketio" });
    setSocket(socket);


    socket.on("device", (device: Device) => {
      setDevices((prevDevices) => {
 
        if (!prevDevices.some((d) => d.id === device.id)) {
          return [...prevDevices, device];
        }
        return prevDevices;
      });
    });

    socket.on("scan_status", (status) => {
      setScanning(status);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startScan = (): void => {
    if (socket) socket.emit("start_scan", {});
  };

  const stopScan = (): void  => {
    if (socket) socket.emit("stop_scan", {});
  };

  return (
    <div className="section">
      <div className="box box-bg">
        <div className="is-size-1 has-text-weight-bold has-text-white">NapicuBLE</div>
        
        <button className="button scan-button" onClick={scanning ? stopScan : startScan}>
          {scanning ? "Stop scan" : "Start scan"}
        </button>



      </div>

      <div className="section">
        <div className="box-device-list">
          {devices.map((device) => (
            <div className="box box-bg has-text-white is-size-6 has-text-weight-bold" key={device.id}>{device.name}</div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default Home;
