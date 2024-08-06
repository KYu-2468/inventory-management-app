import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button, Box } from "@mui/material";

const WebcamCapture = ({ onCapture }) => {
	const webcamRef = useRef(null);
	const [capturedImage, setCapturedImage] = useState(null);

	const capture = useCallback(() => {
		const imageSrc = webcamRef.current.getScreenshot();
		setCapturedImage(imageSrc);
		onCapture(imageSrc);
	}, [webcamRef, onCapture]);

	return (
		<Box>
			{capturedImage ? (
				<Box
					component="img"
					src={capturedImage}
					alt="Captured"
					width="100%"
					height={150}
					sx={{ objectFit: "cover", borderRadius: 2 }}
				/>
			) : (
				<Webcam
					audio={false}
					ref={webcamRef}
					screenshotFormat="image/jpeg"
					width="100%"
					videoConstraints={{ facingMode: "environment" }}
				/>
			)}
			<Button variant="contained" onClick={capture} sx={{ mt: 2 }}>
				Capture Photo
			</Button>
		</Box>
	);
};

export default WebcamCapture;
