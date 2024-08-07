"use client";

import { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	Modal,
	TextField,
	Card,
	CardContent,
	CardActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { firestore, storage } from "@/firebase"; // Assuming your firebase setup is here
import {
	collection,
	doc,
	getDocs,
	query,
	setDoc,
	deleteDoc,
	getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import WebcamCapture from "./WebcamCapture"; // Ensure the path is correct

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "none",
	boxShadow: 24,
	p: 4,
	display: "flex",
	flexDirection: "column",
	gap: 2,
	borderRadius: 2,
};

export default function Home() {
	const [inventory, setInventory] = useState([]);
	const [open, setOpen] = useState(false);
	const [itemName, setItemName] = useState("");
	const [itemImage, setItemImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	const updateInventory = async () => {
		const snapshot = query(collection(firestore, "inventory"));
		const docs = await getDocs(snapshot);
		const inventoryList = [];
		docs.forEach((doc) => {
			inventoryList.push({ name: doc.id, ...doc.data() });
		});
		setInventory(inventoryList);
	};

	useEffect(() => {
		updateInventory();
	}, []);

	const handleFileChange = (event) => {
		if (event.target.files[0]) {
			setItemImage(event.target.files[0]);
			setImagePreview(URL.createObjectURL(event.target.files[0]));
		}
	};

	const handleCapture = (imageSrc) => {
		setImagePreview(imageSrc);
		setItemImage(imageSrc);
	};

	const addItem = async (item) => {
		const docRef = doc(collection(firestore, "inventory"), item);
		const docSnap = await getDoc(docRef);

		let imageUrl = "";
		if (itemImage) {
			const isCameraCapture = itemImage.name === undefined;
			const storageRef = ref(
				storage,
				`images/${
					isCameraCapture ? `${Date.now()}.jpg` : itemImage.name
				}`
			);
			const response = isCameraCapture && (await fetch(itemImage));
			const blob = isCameraCapture && (await response.blob());
			await uploadBytes(storageRef, isCameraCapture ? blob : itemImage);
			imageUrl = await getDownloadURL(storageRef);
		}

		if (docSnap.exists()) {
			const { quantity, imageUrl } = docSnap.data();
			await setDoc(docRef, { quantity: quantity + 1, imageUrl });
		} else {
			await setDoc(docRef, { quantity: 1, imageUrl });
		}
		await updateInventory();
		setItemImage(null);
		setImagePreview(null);
	};

	const removeItem = async (item) => {
		const docRef = doc(collection(firestore, "inventory"), item);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			const { quantity, imageUrl } = docSnap.data();
			if (quantity === 1) {
				await deleteDoc(docRef);
			} else {
				await setDoc(docRef, { quantity: quantity - 1, imageUrl });
			}
		}
		await updateInventory();
	};

	const deleteItem = async (item) => {
		const docRef = doc(collection(firestore, "inventory"), item);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			await deleteDoc(docRef);
		}
		await updateInventory();
	};

	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
		setImagePreview(null);
	};

	const filteredInventory = inventory.filter(({ name }) =>
		name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<Box
			width="100vw"
			display="flex"
			justifyContent="flex-start"
			flexDirection="column"
			alignItems="center"
			gap={4}
			bgcolor="#f8f8f8"
			padding={4}
		>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography
						id="modal-modal-title"
						variant="h6"
						component="h2"
					>
						Add Item
					</Typography>
					<Box
						width="100%"
						display="flex"
						gap={2}
						flexDirection="column"
					>
						<TextField
							id="outlined-basic"
							label="Item"
							variant="outlined"
							fullWidth
							value={itemName}
							onChange={(e) => setItemName(e.target.value)}
						/>
						<Button variant="contained" component="label">
							Upload Image
							<input
								type="file"
								accept="image/*"
								capture="environment"
								hidden
								onChange={handleFileChange}
							/>
							<PhotoCamera />
						</Button>
						{!imagePreview && (
							<WebcamCapture onCapture={handleCapture} />
						)}
						{imagePreview && (
							<Box
								component="img"
								src={imagePreview}
								alt="Image Preview"
								sx={{
									width: "100%",
									height: 150,
									objectFit: "cover",
									borderRadius: 2,
									mt: 2,
								}}
							/>
						)}
						<Button
							variant="contained"
							onClick={() => {
								addItem(itemName);
								setItemName("");
								handleClose();
							}}
						>
							Add
						</Button>
					</Box>
				</Box>
			</Modal>
			<Box
				display="flex"
				width="80%"
				justifyContent="space-between"
				alignItems="center"
				gap={2}
			>
				<Button variant="contained" onClick={handleOpen}>
					Add New Item
				</Button>
				<TextField
					label="Search Inventory"
					variant="outlined"
					fullWidth
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</Box>
			<Box width="80%" borderRadius={2} overflow="hidden">
				<Box
					bgcolor="#1976d2"
					display="flex"
					justifyContent="center"
					alignItems="center"
					paddingY={2}
				>
					<Typography variant="h4" color="white" textAlign="center">
						Inventory Items
					</Typography>
				</Box>
				<Box
					spacing={2}
					padding={2}
					bgcolor="white"
					borderRadius={2}
					boxShadow={1}
					overflow="auto"
					display="flex"
					flexWrap="wrap"
					gap={2}
					justifyContent="center"
				>
					{filteredInventory.map(({ name, quantity, imageUrl }) => (
						<Card
							key={name}
							sx={{
								minWidth: 275,
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								boxShadow: 3,
								"&:hover": {
									boxShadow: 6,
								},
							}}
						>
							<CardContent>
								<Typography
									variant="h6"
									color="text.primary"
									gutterBottom
								>
									{name.charAt(0).toUpperCase() +
										name.slice(1)}
								</Typography>
								{imageUrl && (
									<Box
										component="img"
										src={imageUrl}
										alt={name}
										sx={{
											width: "100%",
											height: 150,
											objectFit: "cover",
										}}
									/>
								)}
								<Typography
									variant="body2"
									color="text.secondary"
								>
									Quantity: {quantity}
								</Typography>
							</CardContent>
							<CardActions>
								<Button
									variant="outlined"
									color="error"
									onClick={() => removeItem(name)}
								>
									<RemoveIcon />
								</Button>
								<Button
									variant="outlined"
									color="primary"
									onClick={() => addItem(name)}
								>
									<AddIcon />
								</Button>
								<Button
									variant="contained"
									color="error"
									onClick={() => deleteItem(name)}
								>
									<DeleteIcon />
								</Button>
							</CardActions>
						</Card>
					))}
				</Box>
			</Box>
		</Box>
	);
}

// "use client";

// import { useState, useEffect } from "react";
// import {
// 	Box,
// 	Stack,
// 	Typography,
// 	Button,
// 	Modal,
// 	TextField,
// 	Paper,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { firestore } from "@/firebase";
// import {
// 	collection,
// 	doc,
// 	getDocs,
// 	query,
// 	setDoc,
// 	deleteDoc,
// 	getDoc,
// } from "firebase/firestore";

// const style = {
// 	position: "absolute",
// 	top: "50%",
// 	left: "50%",
// 	transform: "translate(-50%, -50%)",
// 	width: 400,
// 	bgcolor: "background.paper",
// 	border: "none",
// 	boxShadow: 24,
// 	p: 4,
// 	display: "flex",
// 	flexDirection: "column",
// 	gap: 2,
// 	borderRadius: 2,
// };

// export default function Home() {
// 	const [inventory, setInventory] = useState([]);
// 	const [open, setOpen] = useState(false);
// 	const [itemName, setItemName] = useState("");
// 	const [searchQuery, setSearchQuery] = useState("");

// 	const updateInventory = async () => {
// 		const snapshot = query(collection(firestore, "inventory"));
// 		const docs = await getDocs(snapshot);
// 		const inventoryList = [];
// 		docs.forEach((doc) => {
// 			inventoryList.push({ name: doc.id, ...doc.data() });
// 		});
// 		setInventory(inventoryList);
// 	};

// 	useEffect(() => {
// 		updateInventory();
// 	}, []);

// 	const addItem = async (item) => {
// 		const docRef = doc(collection(firestore, "inventory"), item);
// 		const docSnap = await getDoc(docRef);
// 		if (docSnap.exists()) {
// 			const { quantity } = docSnap.data();
// 			await setDoc(docRef, { quantity: quantity + 1 });
// 		} else {
// 			await setDoc(docRef, { quantity: 1 });
// 		}
// 		await updateInventory();
// 	};

// 	const removeItem = async (item) => {
// 		const docRef = doc(collection(firestore, "inventory"), item);
// 		const docSnap = await getDoc(docRef);
// 		if (docSnap.exists()) {
// 			const { quantity } = docSnap.data();
// 			if (quantity === 1) {
// 				await deleteDoc(docRef);
// 			} else {
// 				await setDoc(docRef, { quantity: quantity - 1 });
// 			}
// 		}
// 		await updateInventory();
// 	};

// 	const deleteItem = async (item) => {
// 		const docRef = doc(collection(firestore, "inventory"), item);
// 		const docSnap = await getDoc(docRef);
// 		if (docSnap.exists()) {
// 			await deleteDoc(docRef);
// 		}
// 		await updateInventory();
// 	};

// 	const handleOpen = () => setOpen(true);
// 	const handleClose = () => setOpen(false);

// 	const filteredInventory = inventory.filter(({ name }) =>
// 		name.toLowerCase().includes(searchQuery.toLowerCase())
// 	);

// 	return (
// 		<Box
// 			width="100vw"
// 			height="100vh"
// 			display="flex"
// 			justifyContent="flex-start"
// 			flexDirection="column"
// 			alignItems="center"
// 			gap={4}
// 			bgcolor="#f8f8f8"
// 			padding={4}
// 		>
// 			<Modal
// 				open={open}
// 				onClose={handleClose}
// 				aria-labelledby="modal-modal-title"
// 				aria-describedby="modal-modal-description"
// 			>
// 				<Box sx={style}>
// 					<Typography
// 						id="modal-modal-title"
// 						variant="h6"
// 						component="h2"
// 					>
// 						Add Item
// 					</Typography>
// 					<Stack width="100%" direction="row" spacing={2}>
// 						<TextField
// 							id="outlined-basic"
// 							label="Item"
// 							variant="outlined"
// 							fullWidth
// 							value={itemName}
// 							onChange={(e) => setItemName(e.target.value)}
// 						/>
// 						<Button
// 							variant="contained"
// 							onClick={() => {
// 								addItem(itemName);
// 								setItemName("");
// 								handleClose();
// 							}}
// 						>
// 							Add
// 						</Button>
// 					</Stack>
// 				</Box>
// 			</Modal>
// 			<Box
// 				display="flex"
// 				width="80%"
// 				justifyContent="space-between"
// 				alignItems="center"
// 				gap={2}
// 			>
// 				<Button variant="contained" onClick={handleOpen}>
// 					Add New Item
// 				</Button>
// 				<TextField
// 					label="Search Inventory"
// 					variant="outlined"
// 					fullWidth
// 					value={searchQuery}
// 					onChange={(e) => setSearchQuery(e.target.value)}
// 				/>
// 			</Box>
// 			<Box width="80%" borderRadius={2} overflow="hidden">
// 				<Box
// 					bgcolor="#1976d2"
// 					display="flex"
// 					justifyContent="center"
// 					alignItems="center"
// 					paddingY={2}
// 				>
// 					<Typography variant="h4" color="white" textAlign="center">
// 						Inventory Items
// 					</Typography>
// 				</Box>
// 				<Stack
// 					spacing={2}
// 					padding={2}
// 					bgcolor="white"
// 					borderRadius={2}
// 					boxShadow={1}
// 					maxHeight="60vh"
// 					overflow="auto"
// 				>
// 					{filteredInventory.map(({ name, quantity }) => (
// 						<Paper
// 							key={name}
// 							elevation={2}
// 							sx={{
// 								display: "flex",
// 								justifyContent: "space-between",
// 								alignItems: "center",
// 								padding: 2,
// 								"&:hover": {
// 									boxShadow: 6,
// 								},
// 							}}
// 						>
// 							<Typography variant="h6" color="text.primary">
// 								{name.charAt(0).toUpperCase() + name.slice(1)}
// 							</Typography>
// 							<Typography variant="h6" color="text.primary">
// 								Quantity: {quantity}
// 							</Typography>
// 							<Box display="flex" gap={1}>
// 								<Button
// 									variant="outlined"
// 									color="error"
// 									onClick={() => removeItem(name)}
// 								>
// 									<RemoveIcon />
// 								</Button>
// 								<Button
// 									variant="outlined"
// 									color="primary"
// 									onClick={() => addItem(name)}
// 								>
// 									<AddIcon />
// 								</Button>
// 								<Button
// 									variant="contained"
// 									color="error"
// 									onClick={() => deleteItem(name)}
// 								>
// 									<DeleteIcon />
// 								</Button>
// 							</Box>
// 						</Paper>
// 					))}
// 				</Stack>
// 			</Box>
// 		</Box>
// 	);
// }
