import React, { useEffect, useRef, useState } from "react";
import redSquareImage from "./a.png";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Include Bootstrap JavaScript
import "./App.css"; // Import your CSS file
import { Button, Modal } from "react-bootstrap";
const initialPositions = {
  step1: { x: 100, y: 30 },
  step2: { x: 128, y: 200 },
};

const DraggableBox = ({
  boxRef,
  currentStep, // Add the currentStep prop here
}: {
  boxRef: React.RefObject<HTMLDivElement>;
  currentStep: number; // Declare the currentStep prop type

}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = 300; // Set your container's width here
  const containerHeight = 315; // Set your container's height here

  const isClicked = useRef<boolean>(false);

  const coords = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  }>({
    startX: 0,
    startY: 0,
    lastX: 100, // Initial left position
    lastY: 30, // Initial top position
  });

  const onMouseDown = (e: MouseEvent) => {
    if (currentStep !== 2) { // Allow dragging only when currentStep is not 2
      isClicked.current = true;
      coords.current.startX = e.clientX;
      coords.current.startY = e.clientY;

      if (currentStep === 1) {
        coords.current.lastX = initialPositions.step1.x;
        coords.current.lastY = initialPositions.step1.y;
      }
    }
  };
  const onMouseUp = () => {
    isClicked.current = false;
    coords.current.lastX = parseInt(boxRef.current!.style.left, 10);
    coords.current.lastY = parseInt(boxRef.current!.style.top, 10);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isClicked.current) return;

    const nextX = e.clientX - coords.current.startX + coords.current.lastX;
    const nextY = e.clientY - coords.current.startY + coords.current.lastY;

    let maxX: number; // Provide a default value here
    let maxY: number; // Provide a default value here

    if (currentStep === 1) {
      maxX = containerWidth - boxRef.current!.offsetWidth;
      maxY = containerHeight - boxRef.current!.offsetHeight;
    } else if (currentStep === 2) {
      maxX = containerWidth - boxRef.current!.offsetWidth - 50;
      maxY = containerHeight - boxRef.current!.offsetHeight - 50;
    } else {
      maxX = 0; // Default value when currentStep is undefined
      maxY = 0; // Default value when currentStep is undefined
    }

    const clampedX = Math.min(Math.max(0, nextX), maxX);
    const clampedY = Math.min(Math.max(0, nextY), maxY);

    boxRef.current!.style.top = `${clampedY}px`;
    boxRef.current!.style.left = `${clampedX}px`;
  };


  useEffect(() => {
    const box = boxRef.current;

    box?.addEventListener("mousedown", onMouseDown);

    return () => {
      box?.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="container ball"
      style={{
        position: "relative",
        width: 300, 
        height:`${currentStep === 2 ? 355 : 315}px`,
        bottom: `${currentStep === 2 ? 524 : 380}px`, // Adjust height based on step
        overflow: "auto ", // Make sure the ball doesn't go outside the container
      }}
    >
      <div
        className="draggable-circle"
        ref={boxRef}
        style={{
          position: "absolute",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "red",
          zIndex: 102,
          cursor: "grab",
          top: `${coords.current.lastY}px`,
          left: `${coords.current.lastX}px`,
        }}
      ></div>
    </div>
  );
};

const Header = ({ handleShowPopup }: { handleShowPopup: () => void }) => {
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const navToggler = document.querySelector(".navbar-toggler");
      const navCollapse = document.querySelector(".navbar-collapse");

      if (
        !navToggler?.contains(event.target as Node) &&
        !navCollapse?.contains(event.target as Node)
      ) {
        navCollapse?.classList.remove("show");
      }
    };

    document.addEventListener("click", handleDocumentClick);

    // Cleanup event listeners
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img
              src="./src/img/logo.png"
              alt="Logo"
              className="logo"
              style={{ width: "50px", height: "auto" }}
            />
            Vision HR
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/about">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/contact">
                  Contact
                </a>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={handleShowPopup}
                >
                  Info
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-white text-center p-3 sticky-footer">
    <div className="container">
      &copy; {new Date().getFullYear()} VisionHR by Analytica.
    </div>
  </footer>
);

const App: React.FC = () => {
  // Refs and state variables are set up here
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showInitialPopup, setShowInitialPopup] = useState(true); // New state variable
  const [showCanvas, setShowCanvas] = useState(true);
  const [snapshotDataURL, setSnapshotDataURL] = useState("");
  const [confirmClicked] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<HTMLImageElement | null>(null); // Add this ref
  const [, setSnapshotData] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Function to handle the Confirm button click
  const handleConfirm = () => {
    const circleElement = boxRef.current;
    const circleRect = circleElement?.getBoundingClientRect();

    if (circleRect && snapshotRef.current && snapshotDataURL) {
      const snapshotBlob = dataURLtoBlob(snapshotDataURL);

      // Get the position of the snapshot image within the window
      const snapshotRect = snapshotRef.current.getBoundingClientRect();

      // Calculate the pixel position of the circle within the snapshot, considering the offset
      const circleX =
        circleRect.left - snapshotRect.left + circleRect.width / 2 - 25;
      const circleY =
        circleRect.top -
        snapshotRect.top +
        circleRect.height / 2 -
        16.212501525878906;

      // Adjust the circle position based on its actual position within the canvas
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const canvasX = circleX - (canvasRect?.left || 0);
      const canvasY = circleY - (canvasRect?.top || 0);

      // Create the data object with the snapshot and coordinates
      const data = new FormData();
      data.append("snapshotBlob", snapshotBlob, "snapshot.jpg");
      data.append("x", canvasX.toString());
      data.append("y", canvasY.toString());
      data.append("currentStep", currentStep.toString()); // Add the currentStep parameter

      // Send the data to the server using fetch
      fetch("http://localhost:8000/upload.php", {
        method: "POST",
        body: data,
      })
        .then((response) => response.text())
        .then((result) => {
          // Handle the server response if needed
          console.log(result);
        })
        .catch((error) => {
          console.error("Error uploading data:", error);
        });
    }
    setCurrentStep((prevStep) => prevStep + 1);
    setShowCanvas(true);
    setSnapshotDataURL("");
    adjustOverlayPosition();
    handleRedo();

  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => prevSlide + 1);
  };
  interface SlideProps {
    imgSrc: string;
    title: string;
    writing: string;
  }

  const Slide: React.FC<SlideProps> = ({ imgSrc, title, writing }) => (
    <div className="d-flex flex-column align-items-center mb-1 image-text-container center-items">
      <h4>{title}</h4>
      <img
        src={imgSrc}
        alt="Slide"
        className="img"
        style={{ width: "250px", height: "auto" }}
      />
      <p className="lead" style={{ textAlign: "center" }}>
        {writing}
      </p>
    </div>
    
  );
  const handlePreviousSlide = () => {
    setCurrentSlide((prevSlide) => prevSlide - 1);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentSlide(1);
  };

  const handleShowPopup = () => {
    setShowPopup(true);
  };
  const handleshowpopuprec = () => {
    if (showInitialPopup) {
      setShowPopup(true);
      setShowInitialPopup(false);
    } else {
      handleSnapshot();
    }
  };
  const adjustOverlayPosition = () => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayRef.current;

    if (canvas && overlayCanvas && showCanvas) {
      const canvasRect = canvas.getBoundingClientRect();
      const { x, y, width, height } = canvasRect;

      overlayCanvas.style.left = `${x}px`;
      overlayCanvas.style.top = `${y + 92}px`;
      overlayCanvas.width = width;
      overlayCanvas.height = height;

      const overlayCtx = overlayCanvas.getContext("2d");
      if (overlayCtx) {
        let imageSrc = ""; // Define the image source based on the current step
        if (currentStep === 1) {
          imageSrc = "./src/a.png";
        } else if (currentStep === 2) {
          imageSrc = "./src/bc.png";
        }
  
        const image = new Image();
        image.src = imageSrc;
        image.addEventListener("load", () => {
          overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          overlayCtx.globalAlpha = 0.5;
          overlayCtx.drawImage(image, 0, 0, overlayCanvas.width, overlayCanvas.height);
  
        });
      }
    }
  };
  useEffect(() => {
    const handleResize = () => {
      adjustOverlayPosition();
    };

    window.addEventListener("resize", handleResize);

    const timeoutId = setTimeout(() => {
      adjustOverlayPosition();
    }, 100); // Adjust the delay if needed

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    //access the camera and stream video
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement("video");
          video.srcObject = stream;
          video.addEventListener("loadedmetadata", () => {
            const canvas = canvasRef.current!;
            const aspectRatio = video.videoWidth / video.videoHeight;
            const width = Math.min(video.videoWidth, 720);
            const height = Math.round(width / aspectRatio);
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const captureFrame = () => {
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                requestAnimationFrame(captureFrame);
              };

              captureFrame();
            }
          });

          video.play();
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    } else {
      console.error("getUserMedia is not supported");
    }
  }, []);

  useEffect(() => {
    // draw an overlay on the canvas
    if (overlayRef.current) {
      const overlayCanvas = overlayRef.current;
      const overlayCtx = overlayCanvas.getContext("2d");
      if (overlayCtx) {
        const image = new Image();
        image.src = redSquareImage;
        image.addEventListener("load", () => {
          overlayCtx.globalAlpha = 0.5;
          overlayCtx.drawImage(
            image,
            0,
            0,
            overlayCanvas.width,
            overlayCanvas.height
          );
        });
      }
    }
  }, []);

  function cropCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentStep: number
  ): HTMLCanvasElement {
    let cropX: number, cropY: number, cropWidth: number, cropHeight: number;
  
    if (currentStep === 1) {
      cropX = 0;
      cropY = 220;
      cropWidth = 655;
      cropHeight = 650;
    } else if (currentStep === 2) {
      cropX = 0; // Adjust as needed for step 2
      cropY = 0; // Adjust as needed for step 2
      cropWidth = 200; // Adjust as needed for step 2
      cropHeight = 200; // Adjust as needed for step 2
    } else {
      cropX = 0; // Default values
      cropY = 0; // Default values
      cropWidth = canvas.width; // Default values
      cropHeight = canvas.height; // Default values
    }
  
    // Create a new canvas to hold the cropped content
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext("2d");
  
    // Draw the cropped content to the new canvas
    if (croppedCtx) {
      croppedCtx.drawImage(
        canvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
    }
  
    return croppedCanvas;
  }
  

  const handleSnapshot = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
  
      if (ctx) {
        const snapshotData = canvas.toDataURL("image/jpeg");
        setSnapshotData(snapshotData);
        const croppedCanvas = cropCanvas(ctx, canvas, currentStep);
  
        setTimeout(() => {
          setShowCanvas(false);
          setSnapshotDataURL(croppedCanvas.toDataURL("image/jpeg"));
  
          // Reset ball position to the correct initial position for Step 2
          if (currentStep === 2) {
            boxRef.current!.style.top = `${initialPositions.step2.y}px`;
            boxRef.current!.style.left = `${initialPositions.step2.x}px`;
          }
        }, 2000);
        setSnapshotTaken(true); // Set the snapshotTaken state to true

      }
    }
  };
    const setupCameraAndCanvas = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setMediaStream(stream); // Store the media stream
          const video = document.createElement("video");
          video.srcObject = stream;
          video.addEventListener("loadedmetadata", () => {
            const canvas = canvasRef.current!;
            const aspectRatio = video.videoWidth / video.videoHeight;
            const width = Math.min(video.videoWidth, 720);
            const height = Math.round(width / aspectRatio);
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const captureFrame = () => {
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                requestAnimationFrame(captureFrame);
              };
              captureFrame();

              // Call adjustOverlayPosition here, after canvas dimensions are set
              adjustOverlayPosition();
            }
          });
          video.play();
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    } else {
      console.error("getUserMedia is not supported");
    }
  };

  const handleRedo = () => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null); // Reset the media stream
    }

    setShowCanvas(true);
    setSnapshotDataURL("");

    setupCameraAndCanvas();
    adjustOverlayPosition();
  };
  

  useEffect(() => {
    setupCameraAndCanvas(); // Setup camera and draw video on canvas
    adjustOverlayPosition();
  }, []);
  useEffect(() => {
    adjustOverlayPosition();
  }, [showCanvas]); // Call the function whenever showCanvas changes

  function dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  return (
    <div>
      <Header handleShowPopup={handleShowPopup} />
      <div className="container mt-4" style={{ textAlign: "right" }}>
        <div
          className="d-flex flex-wrap-reverse justify-content-between"
          style={{ marginTop: "80px" }}
        >
          {/* Right Content */}
          <div>
            <div className="mt-3">
            {showCanvas && (currentStep === 1 || currentStep === 2) && (
            <canvas
                  className={`rounded border border-4 border-danger`}
                  ref={canvasRef}
                  style={{
                    width: "320px",
                    height: "550px",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                    marginLeft: "auto",
                    marginRight: "0",
                  }}
                />
                )}

{showCanvas && currentStep === 1 && (
  <div>
    <canvas
      ref={overlayRef}
      className="overlay"
      style={{
        position: "absolute",
        top: "290px",
        left: "155px",
        width: "290px",
        height: "280px",
        border: "4px solid red",
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    />
  </div>
)}
{showCanvas && currentStep === 2 && (
  <div>
    <canvas
      ref={overlayRef}
      className="overlay"
      style={{
        position: "absolute",
        top: "250px", // Adjust the top position as needed
        left: "185px", // Adjust the left position as needed
        width: "320px", // Adjust the width as needed
        height: "360px", // Adjust the height as needed
        border: "4px solid red",
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    />
  </div>
)}

              {!showCanvas && snapshotDataURL && currentStep === 1 && (
                <img
                  src={snapshotDataURL}
                  alt="Snapshot"
                  className="img rounded border border-4 border-danger"
                  style={{
                    width: "320px",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                    marginLeft: "auto",
                    marginRight: "0",
                  }}
                  ref={snapshotRef} // Add the ref here
                />
              )}
              
  
              {!showCanvas && snapshotDataURL && currentStep === 2 && (
                <img
                  src={snapshotDataURL}
                  alt="Snapshot"
                  className="img rounded border border-4 border-danger"
                  style={{
                    width: "320px",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                    marginLeft: "auto",
                    marginRight: "0",
                  }}
                  ref={snapshotRef} // Add the ref here
                />
              )}      
      
            </div>

            <div className="mt-3">
            {showCanvas && (currentStep === 1 || currentStep === 2) && (
                <button
                  className="btn btn-danger rounded-pill btn-lg ml-2"
                  onClick={handleshowpopuprec}
                >
                  Take Snapshot
                </button>
              )}

              {!showCanvas && (
                <button
                  className="btn btn-danger rounded-pill btn-lg ml-2"
                  onClick={handleRedo}
                >
                  Redo
                </button>
              )}
              {!showCanvas && !confirmClicked && (
                <button
                  className="btn btn-primary rounded-pill btn-lg ml-2"
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
              )}
    {!showCanvas && currentStep === 1 && snapshotTaken && (
      <DraggableBox boxRef={boxRef} currentStep={currentStep} />
    )}

    { !showCanvas && currentStep === 2 && snapshotTaken && (
      <DraggableBox boxRef={boxRef} currentStep={currentStep} />
    )}
                </div>
          </div>
          <div className="a">
            <div className="d-flex align-items-center mb-1 image-text-container center-items">
              {" "}
              {/* Apply center-items class here */}
              <img
                src="./src/img/photo4.png"
                alt="Logo"
                className="img"
                style={{ width: "250px", height: "auto" }}
              />
              <h4>Snapshot Feature</h4>
            </div>

            <div className="d-flex align-items-center mb-1 image-text-container center-items">
              {" "}
              {/* Apply center-items class here */}
              <img
                src="./src/img/image5.png"
                alt="Logo"
                className="img"
                style={{ width: "200px", height: "auto" }}
              />
              <h4>Cropping Feature</h4>
            </div>

            <div className="d-flex align-items-center mb-1 image-text-container center-items">
              {" "}
              {/* Apply center-items class here */}
              <img
                src="./src/img/1.jpg"
                alt="Logo"
                className="img"
                style={{ width: "200px", height: "auto" }}
              />
              <h4>JVP Detection and Adjustment</h4>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Pop-up notification */}
      <Modal show={showPopup} onHide={handleClosePopup}>
        <Modal.Body>
          {currentSlide === 1 && (
            <Slide
              title="JVP CROP"
              imgSrc="./src/img/slide1.png"
              writing="Before we start recording,  read these instructions! Please place your neck in the red square and allign the jugular vein with the frame and then click 'Take Snapshot'. "
            />
          )}
          {currentSlide === 2 && (
            <Slide
              title="Vein Detection"
              imgSrc="./src/img/3.jpg"
              writing="Now that you have taken the snapshot, it will appear with a red dragable circle at the top of your vein."
            />
          )}
          {currentSlide === 3 && (
            <Slide
              title="Adjust and "
              imgSrc="./src/img/4.jpg"
              writing="If the circle is slightly off please drag the circle and adjust the position of it to make it at the top of the vein then click submit and wait for further instructions/ results!"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          {currentSlide > 1 && (
            <Button variant="secondary bg-danger" onClick={handlePreviousSlide}>
              Previous
            </Button>
          )}

          {currentSlide < 3 && (
            <Button variant="primary" onClick={handleNextSlide}>
              Next
            </Button>
          )}
          {currentSlide === 3 && (
            <Button variant="success" onClick={handleClosePopup}>
              OK
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;