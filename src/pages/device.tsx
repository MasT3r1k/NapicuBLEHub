import { ConnectedDevice } from "@/types/ble_device";
import { useState } from "react";

interface DeviceViewProps {
    device: ConnectedDevice;
}

const DeviceView = ({ device }: DeviceViewProps): JSX.Element => {
    const [favorited, setFavorited] = useState(false);

    const handleStarClick = (): void => {
        setFavorited(!favorited); 
    };

    return (
        <div>
            <div className="navbar device-navbar has-text-white" role="navigation">
                <div className="navbar-brand device-navbar-brand">
                    <div className="navbar-item has-text-white is-size-3 has-text-weight-bold">
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

         
            <div className="section main-view-content-list">
             
                    <div className="box-device-view">

                        
                        <div className="box box-inspect-view has-text-white is-size-6 has-text-weight-bold">
                            <div className="view has-text-white is-size-6 has-text-weight-bold">
                                <div>Services</div>
                                <div >
                                    <div className="is-flex">
                                        <div>
                                            fa01395c-164d-467f-9ecd-986688c14b36
                                        </div>
                                        <div>
                                            {'>'}
                                        </div>
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