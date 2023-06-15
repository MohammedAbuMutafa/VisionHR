import React, { useEffect, useRef, useState } from "react";
import redSquareImage from "./a.png";

const App: React.FC = () => {
  // Refs and state variables are set up here
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [, setRecordedChunks] = useState<Blob[]>([]);
  const [isShaking, ] = useState(false);
  const previousFrameRef = useRef<ImageData | null>(null);

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

                if (!recording) {
                  requestAnimationFrame(captureFrame);
                }
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

  const startRecording = () => {
  //start recording video and detect shaking

    setRecording(true); 
    let x = false;

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
                ctx.clearRect(0, 0, 720, 220);
                ctx.clearRect(0, 870, 720, 500);
                ctx.clearRect(650, 0, 720, 1000);
                if (previousFrameRef.current) {
                  const previousFrameData = previousFrameRef.current.data;
                  const currentFrameData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  ).data;

                  let totalPixelDiff = 0;

                  for (let i = 0; i < currentFrameData.length; i += 4) {
                    const rDiff = Math.abs(
                      currentFrameData[i] - previousFrameData[i]
                    );
                    const gDiff = Math.abs(
                      currentFrameData[i + 1] - previousFrameData[i + 1]
                    );
                    const bDiff = Math.abs(
                      currentFrameData[i + 2] - previousFrameData[i + 2]
                    );
                    const pixelDiff = (rDiff + gDiff + bDiff) / 3;

                    totalPixelDiff += pixelDiff;
                  }

                  const averagePixelDiff =
                    totalPixelDiff / (currentFrameData.length / 4);

                  if (averagePixelDiff > 15) {
                    x = true;
                  } else {
                    x = false;
                  }

                  if (x) {
                    setRecording(false);
                    mediaRecorderRef.current?.stop();
                    return;
                  }
                }

                previousFrameRef.current = ctx.getImageData(
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );

                if (recording && mediaRecorderRef.current) {
                  mediaRecorderRef.current.requestData();
                }

                if (!recording) {
                  requestAnimationFrame(captureFrame);
                }
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

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.toBlob((blob) => {
        if (blob) {
          const recordedChunks: Blob[] = [];
          setRecordedChunks(recordedChunks);

          const stream = canvas.captureStream();
          mediaRecorderRef.current = new MediaRecorder(stream);

          mediaRecorderRef.current.ondataavailable = (e) => {
            recordedChunks.push(e.data);
            setRecordedChunks([...recordedChunks]);
          };
          if (x == true) {
            mediaRecorderRef.current.onstop = () => {
              return;
            };
          } else {
            mediaRecorderRef.current.onstop = () => {
              const formData = new FormData();
              const currentDate = new Date().toISOString().split("T")[0]; 
              const fileName = `RecordedVideo-${currentDate}.webm`; 
              const recordedBlob = new Blob(recordedChunks, {
                type: "video/webm",
              });
              formData.append("recordedBlob", recordedBlob, fileName);
              if (!x) {
                fetch("http://localhost:8000/upload.php", {
                  method: "POST",
                  body: formData,
                })
                  .then((response) => response.text())
                  .then((result) => console.log(result))
                  .catch((error) =>
                    console.error("Error uploading file:", error)
                  );

                setRecording(false); 
              }
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
                        ctx.drawImage(
                          video,
                          0,
                          0,
                          video.videoWidth,
                          video.videoHeight
                        );

                        if (!recording) {
                          requestAnimationFrame(captureFrame);
                        }
                      };

                      captureFrame();
                    }
                  });

                  video.play();
                })
                .catch((error) => {
                  console.error("Error accessing camera:", error);
                });
            };
          }
          mediaRecorderRef.current.start();


          setTimeout(() => {
            if (!x) {
              mediaRecorderRef.current?.stop();
            }
          }, 4000);
        }
      }, "video/webm");
    }
  };

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

  return (
    <div>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} />
        <canvas
          ref={overlayRef}
          className="overlay"
          style={{
            position: "absolute",
            top: "220px",
            left: "0px",
            width: "645px",
            height: "645px",
            border: "2px solid red",
            pointerEvents: "none",
            backgroundColor: "transparent",
          }}
        />
      </div>
      {!recording && <button onClick={startRecording}>Start Recording</button>}
      {recording && <button disabled>Recording...</button>}
      {isShaking && recording && <div>Camera is shaking!</div>}
    </div>
  );
};

export default App;
