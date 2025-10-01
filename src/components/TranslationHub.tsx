import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  Volume2, 
  Copy, 
  Download,
  Mic,
  MicOff,
  Play,
  Pause,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  Camera,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TranslationHubProps {
  onClose: () => void;
}

const TranslationHub: React.FC<TranslationHubProps> = ({ onClose }) => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [translationMode, setTranslationMode] = useState<"text-to-sign" | "sign-to-text">("text-to-sign");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatMode, setIsChatMode] = useState(false);
  const [activeTab, setActiveTab] = useState("translate");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI-powered translation function
  const translateText = async (text: string, mode: string) => {
    setIsTranslating(true);
    try {
      let prompt = "";
      if (mode === "text-to-sign") {
        prompt = `Translate this text to Indian Sign Language (ISL): "${text}". Provide detailed hand gesture descriptions, facial expressions, and step-by-step signing instructions.`;
      } else if (mode === "sign-to-text") {
        prompt = `Interpret this sign language description into clear text: "${text}". Provide the most likely meaning and context.`;
      } else if (mode === "image-to-text") {
        prompt = `Analyze this sign language gesture description from an image: "${text}". Identify the signs and provide the text translation with confidence levels.`;
      }

      const { data: functionData, error: functionError } = await supabase.functions.invoke('ai', {
        body: { message: prompt }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to get AI response");
      }

      setTranslatedText(functionData?.response || "Translation not available");
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation Error",
        description: "Failed to translate. Please try again.",
        variant: "destructive"
      });
    }
    setIsTranslating(false);
  };

  const handleTranslate = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to translate",
        variant: "destructive"
      });
      return;
    }
    translateText(inputText, translationMode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard"
    });
  };

  const toggleMode = () => {
    setTranslationMode(prev => 
      prev === "text-to-sign" ? "sign-to-text" : "text-to-sign"
    );
    setInputText("");
    setTranslatedText("");
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not access microphone. Please try again.",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
    }
  };

  // Image upload and processing
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    try {
      // In a real implementation, this would use computer vision AI
      const prompt = `I have uploaded an image containing sign language gestures. Please provide a detailed analysis of what signs might be present and translate them to text. Note: This is a placeholder - in production, this would use image recognition AI to analyze the actual image content.`;
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('ai', {
        body: { message: prompt }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to analyze image");
      }

      setTranslatedText(functionData?.response || "Image analysis not available");
    } catch (error) {
      console.error("Image analysis error:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive"
      });
    }
    setIsTranslating(false);
  };

  // Chatbot functionality
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      const prompt = `You are an ISL (Indian Sign Language) chatbot. The user said: "${chatInput}". Respond in a helpful way about sign language, provide translations, or answer questions about ISL. If they're describing gestures, help translate them to text. If they want to learn signs, provide detailed instructions.`;
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('ai', {
        body: { message: prompt }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to get response");
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: functionData?.response || "Sorry, I couldn't process that request.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
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
              <h1 className="text-3xl font-bold text-foreground">Translation Hub</h1>
              <p className="text-muted-foreground">Real-time language translation</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            AI-Powered
          </Badge>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="translate">Text Translation</TabsTrigger>
            <TabsTrigger value="image">Image Recognition</TabsTrigger>
            <TabsTrigger value="chatbot">ISL Chatbot</TabsTrigger>
            <TabsTrigger value="camera">Live Camera</TabsTrigger>
          </TabsList>

          <TabsContent value="translate">
            <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {translationMode === "text-to-sign" ? "Input Text" : "Sign Language Input"}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleMode}
                  className="flex items-center gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Switch Mode
                </Button>
              </div>
              <CardDescription>
                {translationMode === "text-to-sign" 
                  ? "Enter text to convert to sign language" 
                  : "Describe sign language to convert to text"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={
                  translationMode === "text-to-sign" 
                    ? "Type your message here..." 
                    : "Describe the sign language gestures you see..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] text-base"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/90"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    "Translate"
                  )}
                </Button>
                
                {translationMode === "text-to-sign" && (
                  <Button
                    variant="outline"
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    className="px-4"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {isListening && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                  Listening...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">
                {translationMode === "text-to-sign" ? "Sign Language Output" : "Text Output"}
              </CardTitle>
              <CardDescription>
                {translationMode === "text-to-sign" 
                  ? "Visual representation and description" 
                  : "Converted text from sign language"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[200px] rounded-lg border bg-muted/50 p-4">
                {translatedText ? (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">{translatedText}</p>
                    
                    {translationMode === "text-to-sign" && (
                      <div className="rounded-lg bg-primary/10 p-4">
                        <h4 className="mb-2 font-semibold text-primary">Visual Guide:</h4>
                        <p className="text-sm text-muted-foreground">
                          In a real implementation, this would show animated sign language 
                          demonstrations, hand position guides, and facial expression cues.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {isTranslating ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Generating translation...
                      </div>
                    ) : (
                      "Translation will appear here"
                    )}
                  </div>
                )}
              </div>

              {translatedText && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCopy} className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Speak
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="image">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Image Upload Section */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Upload Sign Language Image</CardTitle>
                  <CardDescription>
                    Upload an image containing sign language gestures for recognition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Label htmlFor="image-upload">Select Image</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className="cursor-pointer"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </Button>
                  </div>

                  {imagePreview && (
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <img
                          src={imagePreview}
                          alt="Selected image"
                          className="w-full max-w-md mx-auto rounded-lg"
                        />
                      </div>
                      <Button
                        onClick={analyzeImage}
                        disabled={isTranslating}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/90"
                      >
                        {isTranslating ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Analyze Image
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Image Analysis Results */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Analysis Results</CardTitle>
                  <CardDescription>
                    Sign language recognition from your image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[200px] rounded-lg border bg-muted/50 p-4">
                    {translatedText && activeTab === "image" ? (
                      <div className="space-y-4">
                        <p className="text-base leading-relaxed">{translatedText}</p>
                        <div className="rounded-lg bg-primary/10 p-4">
                          <h4 className="mb-2 font-semibold text-primary">Recognition Confidence:</h4>
                          <p className="text-sm text-muted-foreground">
                            AI-powered image analysis provides gesture identification and translation
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        {isTranslating ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Analyzing image...
                          </div>
                        ) : (
                          "Analysis results will appear here"
                        )}
                      </div>
                    )}
                  </div>

                  {translatedText && activeTab === "image" && (
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" onClick={handleCopy} className="flex-1">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Volume2 className="mr-2 h-4 w-4" />
                        Speak
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chatbot">
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  ISL Assistant Chatbot
                </CardTitle>
                <CardDescription>
                  Interactive sign language assistant - ask questions, get translations, and learn ISL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[400px] rounded-lg border bg-muted/50 p-4 overflow-y-auto space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="text-center space-y-2">
                        <MessageCircle className="h-12 w-12 mx-auto opacity-50" />
                        <p>Start a conversation with the ISL assistant!</p>
                        <p className="text-sm">Ask about sign language, request translations, or describe gestures.</p>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about sign language, request translations, or describe gestures..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage} disabled={!chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="camera">
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Camera Recognition
                </CardTitle>
                <CardDescription>
                  Real-time sign language detection using your camera
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-8 text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Camera Recognition Coming Soon</p>
                  <p className="text-muted-foreground mb-4">
                    This feature will provide real-time sign language recognition using your device camera.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("translate")}>
                    Try Text Translation Instead
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Translations */}
        <Card className="mt-8 border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Translations</CardTitle>
            <CardDescription>Your translation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Hello, how are you?", "Thank you very much", "Nice to meet you"].map((text, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border bg-background/50 p-3">
                  <span className="text-sm">{text}</span>
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TranslationHub;