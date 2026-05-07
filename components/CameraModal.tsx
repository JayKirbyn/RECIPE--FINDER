'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FolderUp, X, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageBase64: string) => void;
}

export default function CameraModal({ onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } } });
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setError(null);
      setUploadMode(false);
    } catch (err: any) {
      let msg = 'Camera access denied. ';
      if (err.name === 'NotAllowedError') msg += 'Please grant permission.';
      else msg += 'Use file upload instead.';
      setError(msg);
      setUploadMode(true);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg');
    setTimeout(() => onCapture(imageBase64), 200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-soft-lemon">
            <h2 className="text-xl font-bold text-text-dark">
              {uploadMode ? 'Upload Image' : 'Capture Ingredients'}
            </h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-dark">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {!uploadMode && !error ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[60vh] object-cover" />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={captureImage}
                    disabled={isCapturing}
                    className="bg-sunflower hover:bg-golden text-text-dark px-6 py-2 rounded-full font-bold shadow-md transition disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {isCapturing ? 'Capturing...' : 'Capture'}
                  </button>
                  <button
                    onClick={() => setUploadMode(true)}
                    className="bg-white text-text-dark border border-soft-lemon px-6 py-2 rounded-full font-medium hover:bg-soft-lemon transition inline-flex items-center gap-2"
                  >
                    <FolderUp className="w-4 h-4" />
                    Upload
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg inline-flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-4 items-center">
                  <label className="bg-warm-orange hover:bg-orange-500 text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 cursor-pointer shadow-md transition">
                    <Camera className="w-5 h-5" />
                    Take photo 
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="bg-sunflower hover:bg-golden text-text-dark px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 cursor-pointer shadow-md transition">
                    <FolderUp className="w-5 h-5" />
                    Choose from gallery
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button onClick={startCamera} className="mt-2 text-sunflower underline">
                    Try camera again
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}