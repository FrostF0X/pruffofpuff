"use client";

import type {NextPage} from "next";
import {useAccount} from "wagmi";
import {useRef, useState} from "react";
import {Camera} from "react-camera-pro";

const Upload: NextPage = () => {
    const {address: connectedAddress} = useAccount();
    const camera = useRef(null);
    const [image, setImage] = useState(null);
    // @ts-ignore
    const click = () => setImage(camera.current!.takePhoto());
    return (
        <div>
            <Camera ref={camera} errorMessages={'sorry'}/>
            <button onClick={click}>Take photo</button>
            {image ? <img src={image} alt='Taken photo'/> : null}
        </div>
    );
};

export default Upload;
