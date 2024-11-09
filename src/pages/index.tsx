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

  const filter_results = (): void => {

  }

  return (
    <div className="section">
      <div className="box box-bg">
        <div className="is-size-1 has-text-weight-bold has-text-white">NapicuBLE</div>
        




      </div>

      <div className="section">
        <div className="box-device-list">
          {devices.map((device) => (
            <div className="box box-bg has-text-white is-size-6 has-text-weight-bold" key={device.id}>{device.name}</div>
          ))}
        </div>
      </div>

      <div className="buttons-op is-flex is-justify-content-center">
        <button className={`has-text-weight-bold has-text-white is-size-5 ${scanning ? "stop-scan-button" : "scan-button"}`} onClick={scanning ? stopScan : startScan}>
            {scanning ? "Stop scan" : "Start scan"}
        </button>
        <button className="filter-button has-text-weight-bold has-text-white is-size-5" onClick={filter_results}>
            Filter results
        </button>
      </div>
    </div>
  );
};

export default Home;
