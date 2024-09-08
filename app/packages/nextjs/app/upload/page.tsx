"use client";

import type {NextPage} from "next";
import {useRef, useState} from "react";
import {Camera} from "react-camera-pro";

const Upload: NextPage = () => {
    // const {address: connectedAddress} = useAccount();
    const camera = useRef(null);
    const [image, setImage] = useState(null);
    // @ts-ignore
    const click = () => setImage(camera.current!.takePhoto());
    return (
        <div>
            <Camera ref={camera} errorMessages={'sorry'}/>
            <button style={{'position': 'fixed', bottom: '20%', 'left': '50%', 'transform': 'translateX(-50%)', width: '50%'}} onClick={click}>Take photo</button>
            {image ? <img src={image} alt='Taken photo'/> : null}
        </div>
    );
};

export default Upload;
