import { Device } from "@/types/ble_device";
import { useEffect, useState } from "react";
import io from "socket.io-client";



const Home = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [is_filter_menu, setFilter] = useState<boolean>(false);
  //Settings filter
  const [filter_allow_unknown_name, setIsChecked] = useState(true);

  const [uuid_filter_value, set_uuid_filter_value] = useState("");


  useEffect(() => {

    const socket = io({ path: "/api/socketio" });
    setSocket(socket);


    socket.on("device", (device: Device) => {
      setDevices((prevDevices) => {
 
        if (!prevDevices.some((d) => d.address === device.address)) { //TODO
          return [...prevDevices, device];
        }
        return prevDevices;
      });
    });

    socket.on("fail_connect", (status) => {
        alert("fail");
    });

    socket.on("scan_status", (status) => {
      setScanning(status);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const connect = (address: string): void => {
    if (socket) socket.emit("connect_device", address);
  };

  const startScan = (): void => {
    if (socket) socket.emit("start_scan", {});
  };

  const stopScan = (): void  => {
    if (socket) socket.emit("stop_scan", {});
  };

  const on_click_filter_button = (): void => {
    setFilter(!is_filter_menu);
  }

  const handle_unknown_checkbox_change = (event: any) => {
    setIsChecked(event.target.checked);  
  };


  const handle_uuid_input_change = (event: any) => {
    const newValue = event.target.value.replace(/-/g, ""); 
    set_uuid_filter_value(newValue);
    console.log(newValue)
  };

  const handle_input_key_down = (event: any) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };

  return (
    <div className="section">
      <div className="box box-bg">
        <div className="is-size-1 has-text-weight-bold has-text-white">NapicuBLE</div>

      </div>

      <div className="section">
        <div className="box-device-list">
          {devices.map((device) => (
            (filter_allow_unknown_name || !filter_allow_unknown_name && device.name != "Unknown") && (!uuid_filter_value.length || uuid_filter_value.length  && device.uuids?.indexOf(uuid_filter_value) != -1 ) ? (
              <div className="box box-bg has-text-white is-size-6 has-text-weight-bold is-clickable is-unselectable" onClick={() => {connect(device.address)}} key={device.address}>{device.name}
              
                <span className="device-adress"> ({device.address})</span>
               
              </div>    
            ) : null
          ))}
        </div>
      </div>

      <div className="buttons-op is-flex is-justify-content-center">
        <button className={`has-text-weight-bold has-text-white is-size-5 ${scanning ? "stop-scan-button" : "scan-button"}`} onClick={scanning ? stopScan : startScan}>
            {scanning ? "Stop scan" : "Start scan"}
        </button>
        <button className="filter-button has-text-weight-bold has-text-white is-size-5" onClick={on_click_filter_button}>
            Filter results
        </button>
      </div>
    
      {is_filter_menu &&
        <div className="filter-window">
          <div className="section">
              <div className="box has-background-white">
                <div className="has-text-centered is-size-4 has-text-black has-text-weight-bold">Filters</div>

                <div className="filters-options">
                  <div className="container is-flex is-justify-content-space-between is-align-items-center">
                    <div>Allow Unknown name</div>
                    <div className="chck-input">
                      <input type="checkbox" id="custom-checkbox" checked={filter_allow_unknown_name} onChange={handle_unknown_checkbox_change} />
                      <label htmlFor="custom-checkbox" className="checkmark"></label>
                    </div>
                  </div>
                  <div className="container is-flex is-justify-content-space-between is-align-items-center">
                    <div>Filter by service UUID: </div>
                    <div className="uuid-input">
                      <input type="text" value={uuid_filter_value} onChange={handle_uuid_input_change} onKeyDown={handle_input_key_down}/>
                    </div>
                  </div>
                </div>
                <div className="buttons-op is-flex is-justify-content-center">
                  <button className="filter-button has-text-weight-bold has-text-white is-size-6" onClick={on_click_filter_button}>
                      Ok
                  </button>
                </div>

              </div>
          </div>
      
        </div>
      }

    </div>
  );
};

export default Home;
