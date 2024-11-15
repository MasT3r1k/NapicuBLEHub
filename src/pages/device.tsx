import { ConnectedDevice } from "@/types/ble_device";
import { useState } from "react";

interface DeviceViewProps {
    device: ConnectedDevice;
}

const DeviceView = ({ device }: DeviceViewProps): JSX.Element => {
    const [favorited, setFavorited] = useState<boolean>(false);

    const [expandedServiceIndex, setExpandedServiceIndex] = useState<number[]>([0]);


    const [deviceCharDEBUG, setdeviceCharDEBUG] = useState<string[] | undefined>([
        "fa01395c-164d-467f-9ecd-986688c14b36",
        "fafe310f-d81a-4157-8203-a7527590707d",
        "6dd406ab-1f6b-452a-a467-951bcae64201",
        "8989d4eb-9623-4d0b-a2b4-a918e1ff8437",
        "8a40b40f-dd50-474c-b3b9-4dfc94d7f527",
        "e347f3af-8b52-4d8c-8d7b-40663eff8de7"
    ]);


    const handleStarClick = (): void => {
        setFavorited(!favorited);
    };

    const onClickServices = (index: number): void => {
        setExpandedServiceIndex((prevState: number[]) => {
            if (prevState.includes(index)) return prevState.filter(item => item !== index);
            else return [...prevState, index];
        });
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


            <div className="section device-section-view is-relative">
                <div className="left-view-bar">
                    {/* Services */}
                    <div className="box-device-view">
                        <div className="has-background-white box-inspect-view has-text-white">
                            <div className="view">
                                <div className="has-text-black is-size-6 has-text-weight-bold">Services:</div>
                                <div className="inspect-items-view">
                                    {deviceCharDEBUG?.map((uuid, index) => (
                                        <div className="inspect-item has-text-black">
                                            <div className="is-flex is-justify-content-space-between is-align-items-center">
                                                <div className="is-size-6 has-text-weight-medium">
                                                    {uuid}
                                                </div>
                                                <div className="has-text-weight-bold is-clickable" onClick={() => onClickServices(index)}>
                                                    <img className={`more-option-img ${expandedServiceIndex.includes(index) ? 'more-option-img-rotated' : ''}`} src="more-icon.svg" alt="More option" />
                                                </div>
                                            </div>

                                            {expandedServiceIndex.includes(index) ? (
                                                <div className="more-option-view">
                                                    Ahoj
                                                </div>
                                            ) : null}
                                        </div>                                        
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Characteristics */}
                    <div className="box-device-view">
                        <div className="has-background-white box-inspect-view has-text-white">
                            <div className="view">
                                <div className="has-text-black is-size-6 has-text-weight-bold">Characteristics:</div>
                                <div className="inspect-items-view">
                                    {deviceCharDEBUG?.map((uuid) => (
                                        <div>
                                            <div className="is-flex inspect-item has-text-black">
                                                <div className="has-text-black is-size-6 has-text-weight-medium">
                                                    {uuid}
                                                </div>
                                                <div>

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