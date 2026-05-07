// components/CameraModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageBase64: string) => void;
}

export default function CameraModal({ onClose, onCapture }: CameraModalProps) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera with current facingMode
  const startCamera = async () => {
    setError(null);
    setIsCameraReady(false);
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      // Fallback if exact facingMode fails (e.g., no front camera)
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (fallbackErr) {
        setError('Unable to access camera. Please check permissions.');
      }
    }
  };

  // Flip camera
  const flipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Effect to restart camera when facingMode changes
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    onCapture(imageData);
    onClose();
  };

  // Handle file upload from gallery
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onCapture(reader.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden">
        {/* Video preview */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isCameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-yellow border-t-transparent"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-center p-4">
              {error}
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 px-4">
          {/* Flip Camera Button */}
          <button
            onClick={flipCamera}
            className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 transition text-white"
            title="Flip camera"
          >
            <RefreshCw size={24} />
          </button>

          {/* Capture Button - COLORED (primary-yellow) */}
          <button
            onClick={capturePhoto}
            disabled={!isCameraReady}
            className="p-4 rounded-full bg-primary-yellow hover:bg-yellow-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera size={28} className="text-white" />
          </button>

          {/* Upload from Gallery Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 transition text-white"
            title="Upload from gallery"
          >
            <Upload size={24} />
          </button>
        </div>

        {/* Cancel button (top right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition text-white"
        >
          <X size={20} />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}