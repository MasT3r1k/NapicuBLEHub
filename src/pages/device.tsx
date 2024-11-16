import { ConnectedDevice, ConnectedDeviceChar, ConnectedDeviceService } from "@/types/ble_device";
import { log } from "console";
import React, { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";

interface DeviceViewProps {
    device: ConnectedDevice;
}

interface DeviceServiceUUID {
    uuid: string, 
    alias: string | null
}

const DeviceView = ({ device }: DeviceViewProps): JSX.Element => {
    const [letfPanelWidth, setLetfPanelWidth] = useState<number>(300); 
    const [leftPanelResizing, setLeftPanelResizing] = useState<boolean>(false);
    const [initialized, setInitialized] = useState(false);

    const [favorited, setFavorited] = useState<boolean>(false);
    //Services variables
    const [expandedServiceIndex, setExpandedServiceIndex] = useState<number>(-1);
    const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);

    const [expandedCharacteristicIndex, setExpandedCharacteristicIndex] = useState<number>(-1);
    const [selectedCharacteristicIndex, setSelectedCharacteristicIndex] = useState<number>(0);


    const serviceEditInput = useRef<HTMLInputElement>(null); 
    const [serviceNameInput, setServiceNameInput] = useState<string>("");
    
    const [deviceServices, setDeviceServices] = useState<DeviceServiceUUID[]>(device.services.map<DeviceServiceUUID>((service: ConnectedDeviceService) => {
        return {
            uuid: service.uuid,
            alias: null
        }
    }));

    const [deviceCharacteristic, setDeviceCharacteristic] = useState<ConnectedDeviceChar[]>([]);

    // { uuid: "fa01395c-164d-467f-9ecd-986688c14b36", alias: null },
    // { uuid: "fafe310f-d81a-4157-8203-a7527590707d", alias: null },
    // { uuid: "6dd406ab-1f6b-452a-a467-951bcae64201", alias: null },
    // { uuid: "8989d4eb-9623-4d0b-a2b4-a918e1ff8437", alias: null },
    // { uuid: "8a40b40f-dd50-474c-b3b9-4dfc94d7f527", alias: null },
    // { uuid: "e347f3af-8b52-4d8c-8d7b-40663eff8de7", alias: null }

    //Char variables
    


    const handleMouseDownLeftResizer = (event: React.MouseEvent) => {
        event.preventDefault();

        setLeftPanelResizing(true);
    
        const startX: number = event.clientX;
        const startWidth: number = letfPanelWidth;
    
        const handleMouseMove = (moveEvent: MouseEvent): void => {
          const newWidth = startWidth + (moveEvent.clientX - startX);
          if(newWidth >= 240) setLetfPanelWidth(newWidth);
        };
     
        const handleMouseUp = (): void => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setLeftPanelResizing(false);
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleStarClick = (): void => {
        setFavorited(!favorited);
    };

    const onClickService = (index: number): void => {
        setSelectedServiceIndex(index);
        setSelectedCharacteristicIndex(-1);
        setDeviceCharacteristic(device.services[index].chars);
        if(selectedServiceIndex != index) setExpandedServiceIndex(-1);
    }

    const onClickServiceEdit = (event: React.MouseEvent<HTMLImageElement, MouseEvent>, index: number): void => {
        event.stopPropagation();
        onClickService(index);
        setExpandedServiceIndex(expandedServiceIndex == index ? -1 : index);
        setServiceNameInput(deviceServices[index].alias || deviceServices[index].uuid);
    }

    const onClickCharacteristic = (index: number): void => {
        setSelectedCharacteristicIndex(index);
        if(selectedCharacteristicIndex != index) setExpandedCharacteristicIndex(-1);
    }

    const onClickCharacteristicEdit = (event: React.MouseEvent<HTMLImageElement, MouseEvent>, index: number): void => {
        event.stopPropagation();
        onClickCharacteristic(index);
        setExpandedCharacteristicIndex(expandedServiceIndex == index ? -1 : index);
        //setServiceNameInput(deviceServices[index].alias || deviceServices[index].uuid);
    }



    const handleServiceNameKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>, uuid: string) => {
        if (event.key === "Enter") {
            setDeviceServices((prevState) =>
                prevState.map((item) =>
                    item.uuid === uuid ? { ...item, alias: serviceNameInput } : item
                )
            );
            setExpandedServiceIndex(-1);
        }
    };

    const handleServiceNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setServiceNameInput(event.target.value); 
    };


    useEffect(() => {
       if (expandedServiceIndex !== -1 && serviceEditInput.current) {
            serviceEditInput.current.select(); 
        }
    }, [expandedServiceIndex]); 


    return (
        <div className="is-flex is-justify-content-space-between is-flex-direction-column device-section-view">
            <div className="navbar device-navbar has-text-white is-size-6" role="navigation">
                <div className="navbar-brand device-navbar-brand">
                    <div className="navbar-item has-text-white has-text-weight-bold">
                        {device.local_name}
                    </div>
                </div>
                <div className="navbar-menu device-navbar-items is-unselectable">
                    <div className="navbar-start">
                        <div className="navbar-item has-text-white is-clickable">
                            <strong>Inspect</strong>
                        </div>

                        <div className="navbar-item has-text-white is-clickable">
                            <strong>Status</strong>
                        </div>

                        <div className="navbar-item has-text-white is-clickable">
                            <strong>Settings</strong>
                        </div>
                    </div>
                    <div className="navbar-end">
                        <div className="navbar-item">
                            <svg
                                className="is-clickable"
                                width="100px"
                                height="100px"
                                viewBox="-4.5 0 32 32"
                                onClick={handleStarClick}
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5.52 26.96c-0.4 0-0.8-0.12-1.080-0.32-1.68-1.2-0.28-5.32 0.68-7.6-2.12-1.32-5.68-3.84-5.040-5.76 0.4-1.2 2.080-1.76 5.28-1.76 0.84 0 1.64 0.040 2.16 0.080 0.56-2.44 1.88-6.56 3.92-6.56s3.36 4.16 3.92 6.56c0.56-0.040 1.32-0.080 2.16-0.080 3.2 0 4.88 0.56 5.28 1.76 0.64 1.96-2.92 4.48-5.040 5.76 0.96 2.28 2.36 6.4 0.68 7.6-0.28 0.2-0.68 0.32-1.080 0.32-1.8 0-4.64-2.24-5.96-3.32-1.24 1.080-4.080 3.32-5.88 3.32v0z"
                                    fill={favorited ? "#FFD700" : "none"}
                                    stroke="#000000"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>

                        <div className="navbar-item">
                            <div className="buttons">
                                <button className="button disconnect-button has-text-white has-text-weight-bold">
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="device-section-view is-relative">
                <div className="left-view-bar" style={{ width: `${letfPanelWidth}px` }}>
                    <div className={`left-view-bar-resizer ${leftPanelResizing ? 'left-view-bar-resizer-selected' : ''}`} onMouseDown={handleMouseDownLeftResizer}></div>
                    {/* Services */}
                    <div className="box-device-view">
                        <div className=" box-inspect-view has-text-white">
                            <div className="view">
                                <div className="view-bar-section-name has-text-black is-size-5 has-text-weight-bold is-unselectable has-text-centered">Services</div>
                                <div className="inspect-items-view">
                                    {deviceServices?.map((service, index) => (
                                        <div className={`inspect-item ${selectedServiceIndex === index ? 'inspect-item-selected' : ''}`} onClick={() => onClickService(index)}>   
                                            <div className=" has-text-black is-clickable" >
                                                <div className="is-flex is-justify-content-space-between is-align-items-center is-unselectable">
                                                    {expandedServiceIndex == index ? (
                                                        <div>
                                                            <div className="is-italic light-text">You can set the alias for this characteristic:</div>  
                                                            <input
                                                            ref={serviceEditInput}
                                                            type="text"
                                                            className="is-size-6 has-text-weight-bold"
                                                            onChange={handleServiceNameInputChange}
                                                            value={serviceNameInput || ""}
                                                            onKeyDown={(e) => handleServiceNameKeyDownInput(e, service.uuid)}
                                                                />
                                                        </div>
                                                    ) : (
                                                        <div className="is-size-6 has-text-weight-bold uuid-text">
                                                            {service.alias || service.uuid}
                                                        </div>
                                                    )}
                                         
                                                    <div className="has-text-weight-bold is-clickable" >
                                                        <img onClick={(e) => onClickServiceEdit(e, index)} title="Edit the alias of this characteristic" className={`more-option-img ${expandedServiceIndex == index ? 'more-option-img-rotated' : ''}`} src="pen.svg" alt="More option" />
                                                    </div>
                                                </div>
                                            </div>   
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Characteristics */}
                    <div className="box-device-view">
                        <div className=" box-inspect-view has-text-white">
                            <div className="view">
                                <div className="view-bar-section-name has-text-black is-size-5 has-text-weight-bold is-unselectable has-text-centered">Characteristics</div>
                                <div className="inspect-items-view">
                                    {deviceCharacteristic?.map((characteristic, index) => (
                                        <div className={`inspect-item ${selectedCharacteristicIndex === index ? 'inspect-item-selected' : ''}`} onClick={() => onClickCharacteristic(index)}>   
                                            <div className=" has-text-black is-clickable" >
                                                <div className="is-flex is-justify-content-space-between is-align-items-center is-unselectable">

                                                    <div className="is-size-6 has-text-weight-bold uuid-text">
                                                        {characteristic.uuid}
                                                    </div>
                                    
                                         
                                                    <div className="has-text-weight-bold is-clickable" >
                                                        <img onClick={(e) => onClickCharacteristicEdit(e, index)} title="Edit the alias of this characteristic" className={`more-option-img ${expandedServiceIndex == index ? 'more-option-img-rotated' : ''}`} src="pen.svg" alt="More option" />
                                                    </div>
                                                </div>
                                            </div>   
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default DeviceView;