import { ConnectedDeviceChar, BLEDeviceService, CharacteristicResponse, CharacteristicRequest } from "@/types/ble_device";
import React, { useState, useRef, useEffect, useCallback } from "react";
import NapicuCookies from "./Cookies";
import ConsoleView, { ConsoleViewRef, NapicuLogView } from "./console";
import { ConnectedDeviceCharacteristicData, ConnectedDeviceServiceData, DeviceReactViewProps, SelectedCharacteristicCookiesData } from "./interfaces/Idevice";
import CharacteristicsView from "./characteristics";
import { COOKIES_CONSOLE_PANEL_HEIGHT_NAME, COOKIES_LEFT_PANEL_WIDTH_NAME, SIZE_LEFT_PANEL_DEFAULT_WIDTH, SIZE_LEFT_PANEL_MIN_WIDTH, SIZE_CONSOLE_PANEL_DEFAULT_HEIGHT, SIZE_CONSOLE_PANEL_MAX_HEIGHT, SIZE_CONSOLE_PANEL_MIN_HEIGHT, COOKIES_SELECTED_CHARACTERISTIC, COOKIES_UNWATCHED_CHARACTERISTICS, COMMAND_MESSAGE_WRITE_USAGE, COMMAND_MESSAGE_SUBSCRIBE_USAGE, COMMAND_MESSAGE_UNSUBSCRIBE_USAGE, COMMAND_MESSAGE_READ_USAGE, COMMAND_SUBSCRIBE, COMMAND_UNSUBSCRIBE, COMMAND_READ, COMMAND_WRITE } from "./config";
import { CharacteristicsReqHistory } from "./CharacteristicsReqHistory";
import { service_aliases_table, characteristics_aliases_table } from ".";
import { useSocket } from "./Socket";


const DeviceView = ({ device }: DeviceReactViewProps): JSX.Element => {
    const socket = useSocket();

    const [letfPanelWidth, setLeftPanelWidth] = useState<number>(
        () => NapicuCookies.getCookies<number>(COOKIES_LEFT_PANEL_WIDTH_NAME) || SIZE_LEFT_PANEL_DEFAULT_WIDTH);
    const [consolePanelHeight, setConsolePanelHeight] = useState<number>(
        () => NapicuCookies.getCookies<number>(COOKIES_CONSOLE_PANEL_HEIGHT_NAME) || SIZE_CONSOLE_PANEL_DEFAULT_HEIGHT);
    const [leftPanelResizing, setLeftPanelResizing] = useState<boolean>(false);
    const [consolePanelResizing, setConsolePanelResizing] = useState<boolean>(false);
    const [favorited, setFavorited] = useState<boolean>(false);

    //Services variables
    const [expandedServiceIndex, setExpandedServiceIndex] = useState<number>(-1);
    const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);
    //Characteristic variables
    const [expandedCharacteristicIndex, setExpandedCharacteristicIndex] = useState<number>(-1);
    const [selectedCharacteristicIndex, setSelectedCharacteristicIndex] = useState<number>(0);
    //Input for alias
    const aliasEditInput = useRef<HTMLInputElement>(null);
    const [aliasInputValue, setAliasInputValue] = useState<string>("");

    const hasRunRef = useRef<boolean>(false);

    const consoleViewRef = useRef<ConsoleViewRef>(null);

    //Init cookies
    const [deviceServices, setDeviceServices] = useState<ConnectedDeviceServiceData[]>(() => {
        return device.services.map<ConnectedDeviceServiceData>((service: BLEDeviceService) => {
          return {
            uuid: service.uuid,
            alias: service_aliases_table.get_alias_by_key(service.uuid),
            chars: service.chars.map((characteristic: ConnectedDeviceChar) => {
              return {
                ...characteristic,
                alias: characteristics_aliases_table.get_alias_by_key(characteristic.uuid),
                history: new CharacteristicsReqHistory(),
                watch: !NapicuCookies.getCookies<string[]>(COOKIES_UNWATCHED_CHARACTERISTICS)?.includes(characteristic.uuid),
                notify: undefined
              };
            }),
          };
        });
    });

    const handleMouseDownLeftResizer = (event: React.MouseEvent) => {
        event.preventDefault();

        setLeftPanelResizing(true);

        let newWidth: number;
        const startX: number = event.clientX;
        const startWidth: number = letfPanelWidth;

        const handleMouseMove = (moveEvent: MouseEvent): void => {
            newWidth = startWidth + (moveEvent.clientX - startX);
            if (newWidth >= SIZE_LEFT_PANEL_MIN_WIDTH) setLeftPanelWidth(newWidth);
        };

        const handleMouseUp = (): void => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setLeftPanelResizing(false);

            NapicuCookies.setCookies<number>(COOKIES_LEFT_PANEL_WIDTH_NAME, newWidth);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDownConsoleResizer = (event: React.MouseEvent) => {
        event.preventDefault();

        setConsolePanelResizing(true);

        let newHeight: number;
        const startY: number = event.clientY;
        const startHeight: number = consolePanelHeight;

        const handleMouseMove = (moveEvent: MouseEvent): void => {
            newHeight = startHeight + (moveEvent.clientY - startY);

            if (newHeight >= SIZE_CONSOLE_PANEL_MIN_HEIGHT && newHeight <= window.innerHeight - SIZE_CONSOLE_PANEL_MAX_HEIGHT) setConsolePanelHeight(newHeight);
        };

        const handleMouseUp = (): void => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            setConsolePanelResizing(false);

            NapicuCookies.setCookies<number>(COOKIES_CONSOLE_PANEL_HEIGHT_NAME, newHeight);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleStarClick = (): void => {
        setFavorited(!favorited);
    };

    const onClickService = (index: number): void => {
        setSelectedServiceIndex(index);
        setSelectedCharacteristicIndex(0);
        setExpandedCharacteristicIndex(-1);
        if (selectedServiceIndex != index) setExpandedServiceIndex(-1);
    }

    const onClickServiceEdit = (event: React.MouseEvent<HTMLImageElement, MouseEvent>, index: number): void => {
        event.stopPropagation();
        onClickService(index);
        setExpandedServiceIndex(expandedServiceIndex == index ? -1 : index);
        setAliasInputValue(deviceServices[index].alias || deviceServices[index].uuid);
    }

    const onClickCharacteristic = (index: number): void => {
        setSelectedCharacteristicIndex(index);
        setExpandedServiceIndex(-1);
        if (selectedCharacteristicIndex != index) setExpandedCharacteristicIndex(-1);
    }

    const onClickCharacteristicEdit = (event: React.MouseEvent<HTMLImageElement, MouseEvent>, index: number): void => {
        event.stopPropagation();
        onClickCharacteristic(index);
        setExpandedCharacteristicIndex(expandedServiceIndex == index ? -1 : index);
        setAliasInputValue(deviceServices[selectedServiceIndex].chars[index].alias || deviceServices[selectedServiceIndex].chars[index].uuid);
    }

    const handleServiceNameKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>, uuid: string) => {
        if (event.key === "Enter") {
  
            if(!service_aliases_table.is_alias_duplicate(aliasInputValue) || service_aliases_table.get_alias_by_key(uuid)?.toLowerCase() === aliasInputValue.toLowerCase()) {
                setDeviceServices((prevState) =>
                    prevState.map((item) =>
                        item.uuid === uuid ? { ...item, alias: aliasInputValue } : item
                    )
                );
    
                service_aliases_table.set_alias(uuid, aliasInputValue);
                setExpandedServiceIndex(-1);
            } else {
                //TODO ERROR
            }

        }
    };

    const handleCharacteristicNameKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>, uuid: string) => {
        if (event.key === "Enter") {
  
            if(!characteristics_aliases_table.is_alias_duplicate(aliasInputValue) || characteristics_aliases_table.get_alias_by_key(uuid)?.toLowerCase() === aliasInputValue.toLowerCase()) {
                setDeviceServices((prevState) => {
                    return prevState.map((service, index) => {
                        if (index == selectedServiceIndex) {
                            return {
                                ...service,
                                chars: service.chars.map((char) => {
                                    if (char.uuid === uuid) {
                                        return {
                                            ...char,
                                            alias: aliasInputValue, 
                                        };
                                    }
                                    return char; 
                                }),
                            };
                        }
                        return service; 
                    });
                });

                characteristics_aliases_table.set_alias(uuid, aliasInputValue);
                setExpandedCharacteristicIndex(-1);
            } else {

                //TODO ERROR
            }

        }
    };

    const handleAliasInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAliasInputValue(event.target.value);
    };

    const getSelectedServiceCharacteristics = (): ConnectedDeviceCharacteristicData[] => {
        return deviceServices[selectedServiceIndex].chars;
    }

    const findServiceAndCharacteristicIndex = (characteristic_uuid: string): { service_index: number; char_index: number } | null => {
        for (let service_index = 0; service_index < deviceServices.length; service_index++) {
          const chars = deviceServices[service_index].chars;
          for (let char_index = 0; char_index < chars.length; char_index++) {
            if (chars[char_index].uuid === characteristic_uuid) {
              return { service_index, char_index };
            }
          }
        }
        return null; 
    };

    const updateHistory = (char_uuid: string, value: string, type: 'read' | 'write' | 'notify') => {
        setDeviceServices((prevServices: ConnectedDeviceServiceData[]) => {

            const i = findServiceAndCharacteristicIndex(char_uuid);
            if(i) {
                const { service_index, char_index } = i;

                const new_services = [...prevServices];
                const new_chars = [...new_services[service_index].chars];
    
                const updatedChar = {
                    ...new_chars[char_index],
                    history: new CharacteristicsReqHistory(),
                };
                updatedChar.history.history_list = [...new_chars[char_index].history.history_list];
                updatedChar.history.add_with_auto_date(value, type);
        
                new_chars[char_index] = updatedChar;
                new_services[service_index] = {
                    ...new_services[service_index],
                    chars: new_chars,
                };
        
                return new_services;
            }
            return prevServices;
        });
    };

    //TODO 
    useEffect(() => {
        if (expandedServiceIndex !== -1 && aliasEditInput.current) {
            aliasEditInput.current.select();
        }
    }, [expandedServiceIndex]);
    
    useEffect(() => {
        if (expandedCharacteristicIndex !== -1 && aliasEditInput.current) {
            aliasEditInput.current.select();
        }
    }, [expandedCharacteristicIndex]);

    const onCharacteristicResponse = (response: CharacteristicResponse): void => {
        setDeviceServices((current_device_services) => {
            const indexes = findServiceAndCharacteristicIndex(response.uuid);
            const char = indexes && current_device_services[indexes.service_index].chars[indexes.char_index];

            if(char?.watch) {
                NapicuLogView.print({name: characteristics_aliases_table.get_alias_by_key(response.uuid) || response.uuid, message: response.data, color: "white"});
            } 
            
            return current_device_services;
        });

        updateHistory(response.uuid, response.data, "read");
    }

    const onSubscribedCharacteristic = (subscribed_characteristics: string[]): void => {
        setDeviceServices((prevServices: ConnectedDeviceServiceData[]) => {
            return prevServices.map((service: ConnectedDeviceServiceData) => ({
                ...service,
                chars: service.chars.map((char: ConnectedDeviceCharacteristicData) => ({
                    ...char,
                    notify: subscribed_characteristics.includes(char.uuid),
                })),
            }));
        });  
        
    }

    useEffect(() => {
        const selected_device_chars_table: SelectedCharacteristicCookiesData = 
            NapicuCookies.getCookies<SelectedCharacteristicCookiesData>(COOKIES_SELECTED_CHARACTERISTIC) || {};

        selected_device_chars_table[device.address] = deviceServices[selectedServiceIndex].chars[selectedCharacteristicIndex].uuid

        NapicuCookies.setCookies<SelectedCharacteristicCookiesData>(COOKIES_SELECTED_CHARACTERISTIC, selected_device_chars_table);
    }, [selectedCharacteristicIndex]);


    const handleWatchCharacteristicChange = (char_uuid: string, new_value: boolean): void => {
       // setCharacteristic((prev) => ({ ...prev, watch: newWatch }));

       setDeviceServices((prevServices: ConnectedDeviceServiceData[]) => {
            const i = findServiceAndCharacteristicIndex(char_uuid);
            if(i) {
                const { service_index, char_index } = i;

                const new_services = [...prevServices];
                const new_chars = [...new_services[service_index].chars];

                const updatedChar = {
                    ...new_chars[char_index],
                    watch: new_value
                };
            
                new_chars[char_index] = updatedChar;
                new_services[service_index] = {
                    ...new_services[service_index],
                    chars: new_chars,
                };

                var wt_char_table: string[] = NapicuCookies.getCookies<string[]>(COOKIES_UNWATCHED_CHARACTERISTICS) || [];

                if(new_value) {
                    wt_char_table = wt_char_table.filter((uuid: string) => {
                        return uuid !== char_uuid;
                    });
                } else wt_char_table.push(char_uuid);
                
                NapicuCookies.setCookies<string[]>(COOKIES_UNWATCHED_CHARACTERISTICS, wt_char_table);
    
                return new_services;
            }
            return prevServices;
       });
    };

    const consoleHandler = (command: string, args: string[]): void => {
        if(consoleViewRef.current) {
            // SUBSCRIBE COMMAND
            if(COMMAND_SUBSCRIBE.get_all_command_variants().includes(command)) {
                if(args[0]) { 
                    const characteristic_uuid: string  = characteristics_aliases_table.get_name(args[0]) || args[0];
                    const indexes = findServiceAndCharacteristicIndex(characteristic_uuid);

                    if(indexes) {
                        if(deviceServices[indexes.service_index].chars[indexes.char_index].properties.includes("notify")) {
                            socket.emit("subscribe_characteristic", characteristic_uuid);
                        } else consoleViewRef.current.consolePrintError(`Characteristic (${args[0]}) does not have the 'notify' property!`);
                    } else consoleViewRef.current.consolePrintError(`Characteristic with UUID: (${args[0]}) not found!`);
                } else consoleViewRef.current.printUsageError(COMMAND_MESSAGE_SUBSCRIBE_USAGE, "No parameter provided for alias or UUID of the characteristic!");
                
            } 
            // UNSUBSCRIBE COMMAND
            else if (COMMAND_UNSUBSCRIBE.get_all_command_variants().includes(command)) {
                if(args[0] == "all") { // TODO Reserve alias 
                    consoleViewRef.current.consolePrint("Unsubscribing from all notifications...");
                    socket.emit("unsubscribe_all_characteristics");
                } else if(args[0]) {
                    const characteristic_uuid: string = characteristics_aliases_table.get_name(args[0]) || args[0];
                    const indexes = findServiceAndCharacteristicIndex(characteristic_uuid);

                    if(indexes) {
                        if(deviceServices[indexes.service_index].chars[indexes.char_index].properties.includes("notify")) {
                            socket.emit("unsubscribe_characteristic", characteristic_uuid);
                        } else consoleViewRef.current.consolePrintError(`Characteristic (${args[0]}) does not have the 'notify' property!`);
                    } else consoleViewRef.current.consolePrintError(`Characteristic with UUID: (${args[0]}) not found!`);
                } else consoleViewRef.current.printUsageError(COMMAND_MESSAGE_UNSUBSCRIBE_USAGE, "No parameter provided for alias or UUID of the characteristic!");
                
            }
            // WRITE COMMAND
            else if(COMMAND_WRITE.get_all_command_variants().includes(command)) {
                if(args[0]) {
                    const characteristic_uuid: string = characteristics_aliases_table.get_name(args[0]) || args[0];
                    const indexes = findServiceAndCharacteristicIndex(characteristic_uuid);

                    if(indexes) {
                        if(deviceServices[indexes.service_index].chars[indexes.char_index].properties.includes("write")) {
                            if(args[1]) {
                                const data: CharacteristicRequest = {type: "write", value: args[1], uuid: characteristic_uuid};
                                socket.emit("write", data);
                            } else consoleViewRef.current.printUsageError(COMMAND_MESSAGE_WRITE_USAGE, "No message parameter provided!");
                        } else consoleViewRef.current.consolePrintError(`Characteristic (${args[0]}) does not have the 'write' property!`);
                    } else consoleViewRef.current.consolePrintError(`Characteristic with UUID: (${args[0]}) not found!`);
                } else consoleViewRef.current.printUsageError(COMMAND_MESSAGE_WRITE_USAGE, "No parameter provided for alias or UUID of the characteristic!");
            }
            // READ COMMAND
            else if(COMMAND_READ.get_all_command_variants().includes(command)) {
                if(args[0]) {
                    const characteristic_uuid: string = characteristics_aliases_table.get_name(args[0]) || args[0];
                    const indexes = findServiceAndCharacteristicIndex(characteristic_uuid);

                    if(indexes) {
                        if(deviceServices[indexes.service_index].chars[indexes.char_index].properties.includes("read")) {
                            const data: CharacteristicRequest = {type: "read", value: null, uuid: characteristic_uuid};
                            socket.emit("read", data);
                        } else consoleViewRef.current.consolePrintError(`Characteristic (${args[0]}) does not have the 'read' property!`);
                    } else consoleViewRef.current.consolePrintError(`Characteristic with UUID: (${args[0]}) not found!`);
                } else consoleViewRef.current.printUsageError(COMMAND_MESSAGE_READ_USAGE, "No parameter provided for alias or UUID of the characteristic!");
            } 
            else {
                consoleViewRef.current.consolePrintWrongCommand(command);
            }
            
        } else {
            alert("Error when forwarding a console reference! Try restarting the page and try again.");
        }
    } 

    if(!hasRunRef.current) {
        socket.on("characteristic_response", onCharacteristicResponse);
        socket.on("subscribed_characteristics", onSubscribedCharacteristic);
        hasRunRef.current = true;

        const selected_device_chars_table: string | null = 
        NapicuCookies.getCookies<SelectedCharacteristicCookiesData>(COOKIES_SELECTED_CHARACTERISTIC)?.[device.address] || null;

        const i = selected_device_chars_table && findServiceAndCharacteristicIndex(selected_device_chars_table);
        if(i) {
            setSelectedServiceIndex(i.service_index);
            setSelectedCharacteristicIndex(i.char_index);
        }
    }

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
                        <div className="navbar-item is-clickable">
                            <strong className="has-text-white">Inspect</strong>
                        </div>

                        <div className="navbar-item has-text-white is-clickable">
                            <strong className="has-text-white">Status</strong>
                        </div>

                        <div className="navbar-item has-text-white is-clickable">
                            <strong className="has-text-white">Settings</strong>
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
                                    <span>
                                        Disconnect
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="device-section-view device-option-view is-relative">
                <div className="is-inline-flex">
                    <div className="left-view-bar" style={{ width: `${letfPanelWidth}px` }}>
                        <div className={`left-view-bar-resizer is-relative" ${leftPanelResizing ? 'view-bar-resizer-selected' : ''}`} onMouseDown={handleMouseDownLeftResizer}></div>
                        <div>

                            {/* Services */}
                            <div className="box-device-view">
                                <div className=" box-inspect-view has-text-white">
                                    <div className="view">
                                        <div className="view-bar-section-name has-text-black is-size-5 has-text-weight-bold is-unselectable has-text-centered">Services</div>
                                        <div className="inspect-items-view">
                                            {deviceServices?.map((service, index) => (
                                                <div key={index} className={`inspect-item ${selectedServiceIndex === index ? 'inspect-item-selected' : ''}`} onClick={() => onClickService(index)}>
                                                    <div className=" has-text-black is-clickable" >
                                                        <div className="is-flex is-justify-content-space-between is-align-items-center is-unselectable">
                                                            {expandedServiceIndex == index ? (
                                                                <div>
                                                                    <div className="is-italic light-text">You can set the alias for this service:</div>
                                                                    <input
                                                                        ref={aliasEditInput}
                                                                        type="text"
                                                                        className="is-size-6 has-text-weight-bold"
                                                                        onChange={handleAliasInputChange}
                                                                        value={aliasInputValue || ""}
                                                                        onKeyDown={(e) => handleServiceNameKeyDownInput(e, service.uuid)}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="is-size-6 has-text-weight-bold uuid-text">
                                                                    {service.alias || service.uuid}
                                                                </div>
                                                            )}

                                                            <div className="has-text-weight-bold is-clickable more-option-edt" >
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
                                            {getSelectedServiceCharacteristics()?.map((characteristic, index) => (
                                                <div key={index} className={`inspect-item ${selectedCharacteristicIndex === index ? 'inspect-item-selected' : ''}`} onClick={() => onClickCharacteristic(index)}>
                                                    <div className=" has-text-black is-clickable" >
                                                        <div className="is-flex is-justify-content-space-between is-align-items-center is-unselectable">
                                                            {expandedCharacteristicIndex == index ? (
                                                                    <div>
                                                                        <div className="is-italic light-text">You can set the alias for this characteristic:</div>
                                                                        <input
                                                                            ref={aliasEditInput}
                                                                            type="text"
                                                                            className="is-size-6 has-text-weight-bold"
                                                                            onChange={handleAliasInputChange}
                                                                            value={aliasInputValue || ""}
                                                                            onKeyDown={(e) => handleCharacteristicNameKeyDownInput(e, characteristic.uuid)}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="is-size-6 has-text-weight-bold uuid-text">
                                                                        {characteristic.alias || characteristic.uuid}
                                                                    </div>
                                                                )}


                                                            <div className="has-text-weight-bold is-clickable more-option-edt">
                                                                <img onClick={(e) => onClickCharacteristicEdit(e, index)} title="Edit the alias of this characteristic" className={`more-option-img ${expandedServiceIndex == index ? 'more-option-img-rotated' : ''}`} src="pen.svg" alt="More option" />
                                                            </div>
                                                        </div>
                                                        <div className="characteristics-properties is-flex">
                                                            <div className={`characteristics-properties-read ${!characteristic.properties.includes("read") ? 'characteristics-properties-unabled' : ''}`} title="Read">R</div>
                                                            <div className={`characteristics-properties-write ${!characteristic.properties.includes("write") ? 'characteristics-properties-unabled' : ''}`} title="Write">W</div>
                                                            <div className={`characteristics-properties-notify ${!characteristic.properties.includes("notify") ? 'characteristics-properties-unabled' : ''}`} title="Notify">N</div>
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


                <div className="right-view-bar">

                    <div className="main-view is-relative" style={{ height: `${consolePanelHeight}px` }}>
                        <div className={`console-view-bar-resizer left-view-bar-resizer is-relative" ${consolePanelResizing ? 'view-bar-resizer-selected' : ''}`} onMouseDown={handleMouseDownConsoleResizer}></div>
                        {getSelectedServiceCharacteristics().length && (
                            <CharacteristicsView characteristic={getSelectedServiceCharacteristics()[selectedCharacteristicIndex]} onWatchChange={handleWatchCharacteristicChange} />
                        )}
                    </div>

                    <div className="bottom-console" >
                        <ConsoleView device={device} consoleHandler={consoleHandler} ref={consoleViewRef} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeviceView;