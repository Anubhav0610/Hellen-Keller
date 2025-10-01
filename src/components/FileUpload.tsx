import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Upload, 
  File, 
  Image,
  Video,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  analysis?: {
    gesturesDetected: number;
    confidence: number;
    description: string;
    suggestions: string[];
  };
}

const FileUpload: React.FC<FileUploadProps> = ({ onClose }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload images (JPEG, PNG, GIF) or videos (MP4, WebM)",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 50MB",
          variant: "destructive"
        });
        return;
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);
      simulateUploadAndAnalysis(newFile);
    });
  };

  const simulateUploadAndAnalysis = async (file: UploadedFile) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, progress } : f)
      );
    }

    // Update to processing status
    setUploadedFiles(prev => 
      prev.map(f => f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f)
    );

    // Simulate AI analysis
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadedFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, progress } : f)
      );
    }

    // Complete analysis with mock results
    const mockAnalysis = {
      gesturesDetected: Math.floor(Math.random() * 5) + 1,
      confidence: Math.floor(Math.random() * 30) + 70,
      description: "Detected multiple hand gestures including greeting signs and basic ASL letters.",
      suggestions: [
        "Try positioning hands more centered in frame",
        "Ensure good lighting for better recognition",
        "Hold gestures for 2-3 seconds for optimal detection"
      ]
    };

    setUploadedFiles(prev => 
      prev.map(f => f.id === file.id ? { 
        ...f, 
        status: 'completed', 
        progress: 100, 
        analysis: mockAnalysis 
      } : f)
    );

    toast({
      title: "Analysis Complete",
      description: `Found ${mockAnalysis.gesturesDetected} gestures with ${mockAnalysis.confidence}% confidence`
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return File;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return Loader2;
      case 'completed':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      default:
        return File;
    }
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
              <h1 className="text-3xl font-bold text-foreground">File Analysis</h1>
              <p className="text-muted-foreground">Upload images and videos for gesture recognition</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Upload className="mr-1 h-4 w-4" />
            AI Analysis
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Drag and drop or click to upload images and videos for gesture analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Drop files here</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Support for images (JPEG, PNG, GIF) and videos (MP4, WebM)
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/90"
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  <p>• Maximum file size: 50MB</p>
                  <p>• Supported formats: JPEG, PNG, GIF, MP4, WebM</p>
                  <p>• Multiple files can be uploaded simultaneously</p>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card className="mt-6 border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      const StatusIcon = getStatusIcon(file.status);
                      
                      return (
                        <div key={file.id} className="flex items-center gap-4 rounded-lg border bg-background/50 p-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50">
                            <FileIcon className="h-6 w-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{file.name}</h4>
                              <div className="flex items-center gap-2">
                                <StatusIcon className={`h-4 w-4 ${
                                  file.status === 'uploading' || file.status === 'processing' 
                                    ? 'animate-spin text-primary' 
                                    : file.status === 'completed' 
                                    ? 'text-success' 
                                    : 'text-destructive'
                                }`} />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)} • {file.status}
                            </p>
                            
                            {(file.status === 'uploading' || file.status === 'processing') && (
                              <div className="mt-2">
                                <Progress value={file.progress} className="h-2" />
                              </div>
                            )}

                            {file.analysis && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-success">
                                    {file.analysis.gesturesDetected} gestures detected
                                  </span>
                                  <span className="text-muted-foreground">
                                    {file.analysis.confidence}% confidence
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {file.analysis.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload files to see analysis results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Files</span>
                      <span className="font-semibold">{uploadedFiles.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-semibold">
                        {uploadedFiles.filter(f => f.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Processing</span>
                      <span className="font-semibold">
                        {uploadedFiles.filter(f => f.status === 'processing' || f.status === 'uploading').length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Better Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>Ensure hands are clearly visible and well-lit</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>Use a plain background when possible</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>Hold gestures steady for clear capture</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>Include full hand and wrist in frame</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;