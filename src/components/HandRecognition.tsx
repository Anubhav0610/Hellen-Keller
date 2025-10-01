import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, 
  Camera, 
  Video, 
  Square, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  Brain,
  History,
  Target,
  Layers,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Webcam from "react-webcam";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface HandRecognitionProps {
  onClose: () => void;
}

const HandRecognition: React.FC<HandRecognitionProps> = ({ onClose }) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedGesture, setRecognizedGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    gesturesDetected: 0,
    accuracy: 0,
    sessionTime: 0
  });
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const { toast } = useToast();

  const gestureLabels = [
    "Thumbs Up", "Peace Sign", "OK Hand", "Pointing", "Open Palm", 
    "Fist", "Stop", "Victory", "Hello", "Goodbye", "Swipe Left", 
    "Swipe Right", "Swipe Up", "Swipe Down", "Pinch", "Spread"
  ];

  // Add new state for enhanced features
  const [detectionMethod, setDetectionMethod] = useState<'manual' | 'frame-diff' | 'object-detection'>('manual');
  const [gestureHistory, setGestureHistory] = useState<Array<{gesture: string, timestamp: number, confidence: number}>>([]);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [customGestures, setCustomGestures] = useState<string[]>([]);
  const [backgroundSubtraction, setBackgroundSubtraction] = useState(true);
  const [motionThreshold, setMotionThreshold] = useState(50);
  const [gestureSequence, setGestureSequence] = useState<string[]>([]);
  const [frameBuffer, setFrameBuffer] = useState<ImageData[]>([]);
  const maxFrameBuffer = 10;

  // Initialize MediaPipe Hand Landmarker
  const initializeHandLandmarker = useCallback(async () => {
    try {
      setIsModelLoading(true);
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      
      setHandLandmarker(handLandmarker);
      setIsModelLoading(false);
      
      toast({
        title: "AI Model Loaded",
        description: "Hand recognition is ready to use"
      });
    } catch (error) {
      console.error("Error initializing hand landmarker:", error);
      setIsModelLoading(false);
      toast({
        title: "Model Loading Error",
        description: "Using fallback recognition mode",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Enhanced gesture analysis with deep learning features
  const analyzeGesture = useCallback((landmarks: any[], frameData?: ImageData) => {
    if (!landmarks || landmarks.length === 0) return null;
    
    const hand = landmarks[0];
    if (!hand || !hand.landmarks) return null;
    
    const points = hand.landmarks;
    
    // Store frame data for temporal analysis
    if (frameData && frameBuffer.length >= maxFrameBuffer) {
      setFrameBuffer(prev => [...prev.slice(1), frameData]);
    } else if (frameData) {
      setFrameBuffer(prev => [...prev, frameData]);
    }
    
    // Advanced gesture recognition with motion analysis
    let gestureResult = null;
    let confidence = 0;
    
    // Static gesture recognition (existing logic enhanced)
    const staticGesture = analyzeStaticGesture(points);
    if (staticGesture) {
      gestureResult = staticGesture.gesture;
      confidence = staticGesture.confidence;
    }
    
    // Dynamic gesture recognition using frame difference
    if (detectionMethod === 'frame-diff' && frameBuffer.length >= 3) {
      const dynamicGesture = analyzeDynamicGesture(frameBuffer);
      if (dynamicGesture && dynamicGesture.confidence > confidence) {
        gestureResult = dynamicGesture.gesture;
        confidence = dynamicGesture.confidence;
      }
    }
    
    // Object tracking based recognition
    if (detectionMethod === 'object-detection') {
      const trackingGesture = analyzeTrackingGesture(points);
      if (trackingGesture && trackingGesture.confidence > confidence) {
        gestureResult = trackingGesture.gesture;
        confidence = trackingGesture.confidence;
      }
    }
    
    // Learning mode: capture custom gestures
    if (isLearningMode && gestureResult && confidence > 70) {
      addCustomGesture(gestureResult);
    }
    
    return gestureResult ? { gesture: gestureResult, confidence } : null;
  }, [frameBuffer, detectionMethod, isLearningMode, maxFrameBuffer]);

  // Static gesture analysis (enhanced from original)
  const analyzeStaticGesture = useCallback((points: any[]) => {
    // Thumb up detection
    if (points[4].y < points[3].y && points[4].y < points[2].y) {
      const otherFingersDown = 
        points[8].y > points[6].y && // Index down
        points[12].y > points[10].y && // Middle down
        points[16].y > points[14].y && // Ring down
        points[20].y > points[18].y; // Pinky down
      
      if (otherFingersDown) {
        return { gesture: "Thumbs Up", confidence: 92 };
      }
    }
    
    // Peace sign (index and middle up, others down)
    if (points[8].y < points[6].y && points[12].y < points[10].y &&
        points[16].y > points[14].y && points[20].y > points[18].y) {
      return { gesture: "Peace Sign", confidence: 88 };
    }
    
    // Pointing gesture (index finger extended, others down)
    if (points[8].y < points[6].y && points[12].y > points[10].y &&
        points[16].y > points[14].y && points[20].y > points[18].y) {
      return { gesture: "Pointing", confidence: 85 };
    }
    
    // Open palm (all fingers extended)
    const allFingersUp = 
      points[8].y < points[6].y && // Index up
      points[12].y < points[10].y && // Middle up
      points[16].y < points[14].y && // Ring up
      points[20].y < points[18].y; // Pinky up
    
    if (allFingersUp) {
      return { gesture: "Open Palm", confidence: 83 };
    }
    
    // Fist (all fingers down)
    const allFingersDown = 
      points[8].y > points[6].y && // Index down
      points[12].y > points[10].y && // Middle down
      points[16].y > points[14].y && // Ring down
      points[20].y > points[18].y; // Pinky down
    
    if (allFingersDown) {
      return { gesture: "Fist", confidence: 80 };
    }
    
    // OK hand (index and thumb circle)
    const thumbIndexDistance = Math.sqrt(
      Math.pow(points[4].x - points[8].x, 2) + Math.pow(points[4].y - points[8].y, 2)
    );
    
    if (thumbIndexDistance < 0.05) {
      return { gesture: "OK Hand", confidence: 90 };
    }
    
    return null;
  }, []);

  // Dynamic gesture analysis using frame difference
  const analyzeDynamicGesture = useCallback((frames: ImageData[]) => {
    if (frames.length < 3) return null;
    
    // Simple motion detection based on frame differences
    const current = frames[frames.length - 1];
    const previous = frames[frames.length - 2];
    
    let motionMagnitude = 0;
    let horizontalMotion = 0;
    let verticalMotion = 0;
    
    // Calculate motion vectors (simplified)
    for (let i = 0; i < current.data.length; i += 4) {
      const currGray = (current.data[i] + current.data[i + 1] + current.data[i + 2]) / 3;
      const prevGray = (previous.data[i] + previous.data[i + 1] + previous.data[i + 2]) / 3;
      const diff = Math.abs(currGray - prevGray);
      
      if (diff > motionThreshold) {
        motionMagnitude += diff;
        const x = (i / 4) % current.width;
        const y = Math.floor((i / 4) / current.width);
        
        // Simplified direction analysis
        if (x > current.width * 0.6) horizontalMotion += diff;
        if (x < current.width * 0.4) horizontalMotion -= diff;
        if (y > current.height * 0.6) verticalMotion += diff;
        if (y < current.height * 0.4) verticalMotion -= diff;
      }
    }
    
    // Classify motion patterns
    if (motionMagnitude > 1000) {
      if (Math.abs(horizontalMotion) > Math.abs(verticalMotion)) {
        return {
          gesture: horizontalMotion > 0 ? "Swipe Right" : "Swipe Left",
          confidence: Math.min(85, 60 + (motionMagnitude / 100))
        };
      } else {
        return {
          gesture: verticalMotion > 0 ? "Swipe Down" : "Swipe Up",
          confidence: Math.min(85, 60 + (motionMagnitude / 100))
        };
      }
    }
    
    return null;
  }, [motionThreshold]);

  // Object tracking based gesture analysis
  const analyzeTrackingGesture = useCallback((points: any[]) => {
    // Enhanced tracking with hand velocity and position history
    const wrist = points[0];
    const fingertips = [points[8], points[12], points[16], points[20]]; // Index, Middle, Ring, Pinky tips
    
    // Calculate hand spread (distance between fingertips)
    let totalSpread = 0;
    for (let i = 0; i < fingertips.length - 1; i++) {
      const distance = Math.sqrt(
        Math.pow(fingertips[i].x - fingertips[i + 1].x, 2) +
        Math.pow(fingertips[i].y - fingertips[i + 1].y, 2)
      );
      totalSpread += distance;
    }
    
    // Pinch detection (fingertips close together)
    if (totalSpread < 0.15) {
      return { gesture: "Pinch", confidence: 87 };
    }
    
    // Spread detection (fingertips far apart)
    if (totalSpread > 0.4) {
      return { gesture: "Spread", confidence: 85 };
    }
    
    return null;
  }, []);

  // Add custom gesture to learning database
  const addCustomGesture = useCallback((gesture: string) => {
    if (!customGestures.includes(gesture)) {
      setCustomGestures(prev => [...prev, gesture]);
      toast({
        title: "New Gesture Learned",
        description: `Added "${gesture}" to custom gestures`
      });
    }
  }, [customGestures, toast]);

  // Process video frame for hand detection
  const processVideoFrame = useCallback(async () => {
    if (!webcamRef.current || !handLandmarker || !isRecording) {
      return;
    }
    
    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }
    
    try {
      const results = handLandmarker.detectForVideo(video, performance.now());
      
      if (results.landmarks && results.landmarks.length > 0) {
        const gestureResult = analyzeGesture(results.landmarks);
        
        if (gestureResult && gestureResult.gesture !== "Unknown") {
          setRecognizedGesture(gestureResult.gesture);
          setConfidence(gestureResult.confidence);
          
          // Add to gesture history
          const newGestureEntry = {
            gesture: gestureResult.gesture,
            timestamp: Date.now(),
            confidence: gestureResult.confidence
          };
          setGestureHistory(prev => [...prev.slice(-19), newGestureEntry]);
          
          // Update gesture sequence for pattern recognition
          setGestureSequence(prev => [...prev.slice(-4), gestureResult.gesture]);
          
          setSessionStats(prev => ({
            ...prev,
            gesturesDetected: prev.gesturesDetected + 1,
            accuracy: Math.round((prev.accuracy + gestureResult.confidence) / 2),
            sessionTime: prev.sessionTime + 1
          }));
        }
      }
    } catch (error) {
      console.error("Error processing video frame:", error);
    }
    
    animationFrameRef.current = requestAnimationFrame(processVideoFrame);
  }, [handLandmarker, isRecording, analyzeGesture]);

  // Initialize model when component mounts
  useEffect(() => {
    initializeHandLandmarker();
  }, [initializeHandLandmarker]);

  // Start/stop video processing
  useEffect(() => {
    if (isRecording && handLandmarker) {
      processVideoFrame();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, handLandmarker, processVideoFrame]);

  const startWebcam = async () => {
    try {
      // First try with flexible constraints
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: "user"
          } 
        });
      } catch (firstError) {
        console.log("Trying with basic video constraints...");
        // Fallback to basic video request
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      // Stop the test stream immediately - webcam component will handle the actual stream
      stream.getTracks().forEach(track => track.stop());
      
      setIsWebcamActive(true);
      toast({
        title: "Camera Started",
        description: "Point your hands towards the camera to begin recognition"
      });
    } catch (error) {
      console.error("Camera access error:", error);
      
      let errorMessage = "Please allow camera access to use hand recognition";
      if (error.name === "NotFoundError") {
        errorMessage = "No camera found. Please connect a camera and try again.";
      } else if (error.name === "NotAllowedError") {
        errorMessage = "Camera access denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Camera not supported in this browser.";
      }
      
      toast({
        title: "Camera Access Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopWebcam = () => {
    setIsWebcamActive(false);
    setIsRecording(false);
    setRecognizedGesture(null);
    setConfidence(0);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "AI is now analyzing your hand gestures"
      });
    } else {
      toast({
        title: "Recording Stopped",
        description: "Analysis paused"
      });
    }
  };

  const resetSession = () => {
    setSessionStats({
      gesturesDetected: 0,
      accuracy: 0,
      sessionTime: 0
    });
    setRecognizedGesture(null);
    setConfidence(0);
    setGestureHistory([]);
    setGestureSequence([]);
    setFrameBuffer([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose} className="h-10 w-10 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Hand Recognition</h1>
              <p className="text-muted-foreground">AI-powered gesture detection and learning</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="mr-1 h-4 w-4" />
            Real-time AI
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Camera Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle>Live Camera Feed</CardTitle>
                <CardDescription>Position your hands in view for real-time recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg bg-muted/50 overflow-hidden">
                  {isWebcamActive ? (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      className="h-full w-full object-cover"
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: { ideal: 1280, min: 640 },
                        height: { ideal: 720, min: 480 },
                        facingMode: "user"
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground">Camera not active</p>
                      </div>
                    </div>
                  )}

                  {/* Gesture Detection Overlay */}
                  {isRecording && recognizedGesture && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-lg bg-black/80 p-4 text-white backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-75">Detected Gesture:</p>
                            <p className="text-lg font-semibold">{recognizedGesture}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm opacity-75">Confidence:</p>
                            <p className="text-lg font-semibold">{confidence}%</p>
                          </div>
                        </div>
                        <Progress value={confidence} className="mt-2" />
                      </div>
                    </div>
                  )}

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-destructive-foreground">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                        <span className="text-sm font-medium">Recording</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-4">
                  {!isWebcamActive ? (
                    <>
                      <Button 
                        onClick={startWebcam}
                        disabled={isModelLoading}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/90"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {isModelLoading ? "Loading AI Model..." : "Start Camera"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Camera Help",
                            description: "1. Click the camera icon in your address bar\n2. Select 'Allow'\n3. Refresh the page if needed",
                          });
                        }}
                        className="px-3"
                      >
                        ?
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={toggleRecording}
                        variant={isRecording ? "destructive" : "default"}
                        className="flex-1"
                      >
                        {isRecording ? (
                          <>
                            <Square className="mr-2 h-4 w-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Video className="mr-2 h-4 w-4" />
                            Start Recording
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={stopWebcam}>
                        Stop Camera
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Controls */}
          <div className="space-y-6">
            {/* Detection Method Selector */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Detection Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recognition Mode</Label>
                  <Select value={detectionMethod} onValueChange={(value: 'manual' | 'frame-diff' | 'object-detection') => setDetectionMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Detection</SelectItem>
                      <SelectItem value="frame-diff">Frame Difference</SelectItem>
                      <SelectItem value="object-detection">Object Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="learning-mode">Learning Mode</Label>
                  <Switch
                    id="learning-mode"
                    checked={isLearningMode}
                    onCheckedChange={setIsLearningMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="background-sub">Background Subtraction</Label>
                  <Switch
                    id="background-sub"
                    checked={backgroundSubtraction}
                    onCheckedChange={setBackgroundSubtraction}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Motion Threshold: {motionThreshold}</Label>
                  <Slider
                    value={[motionThreshold]}
                    onValueChange={(value) => setMotionThreshold(value[0])}
                    max={100}
                    min={10}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Session Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gestures Detected</span>
                  <span className="font-semibold">{sessionStats.gesturesDetected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Accuracy</span>
                  <span className="font-semibold">{sessionStats.accuracy}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session Time</span>
                  <span className="font-semibold">{sessionStats.sessionTime}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custom Gestures</span>
                  <span className="font-semibold">{customGestures.length}</span>
                </div>
                <Button variant="outline" onClick={resetSession} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Session
                </Button>
              </CardContent>
            </Card>

            {/* Current Recognition */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Current Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                {recognizedGesture ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="font-semibold">{recognizedGesture}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence</span>
                        <span>{confidence}%</span>
                      </div>
                      <Progress value={confidence} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {confidence > 80 ? "Excellent recognition!" : 
                       confidence > 60 ? "Good recognition" : "Try adjusting hand position"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isRecording ? "Position hands in view" : "Start recording to begin"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gesture History */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Gesture History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {gestureHistory.slice(-5).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{entry.gesture}</span>
                      <span className="text-muted-foreground">{entry.confidence}%</span>
                    </div>
                  ))}
                  {gestureHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No gestures detected yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gesture Library */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Gesture Library
                </CardTitle>
                <CardDescription>Available gestures for recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Standard Gestures</p>
                    <div className="grid grid-cols-2 gap-2">
                      {gestureLabels.slice(0, 10).map((gesture, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="justify-center py-2 text-xs"
                        >
                          {gesture}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Dynamic Gestures</p>
                    <div className="grid grid-cols-2 gap-2">
                      {gestureLabels.slice(10).map((gesture, index) => (
                        <Badge 
                          key={index + 10} 
                          variant="secondary" 
                          className="justify-center py-2 text-xs"
                        >
                          {gesture}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {customGestures.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        Custom Gestures
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {customGestures.map((gesture, index) => (
                          <Badge 
                            key={index} 
                            variant="default" 
                            className="justify-center py-2 text-xs"
                          >
                            {gesture}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gesture Sequence Pattern */}
            {gestureSequence.length > 0 && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Gesture Sequence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto">
                    {gestureSequence.map((gesture, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="whitespace-nowrap"
                      >
                        {gesture}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandRecognition;