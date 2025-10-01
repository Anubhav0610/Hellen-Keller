import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Hand, 
  MessageSquare, 
  BookOpen, 
  Camera, 
  Upload, 
  Users, 
  Award,
  TrendingUp,
  Heart,
  Globe
} from "lucide-react";
import TranslationHub from "@/components/TranslationHub";
import HandRecognition from "@/components/HandRecognition";
import LearningCenter from "@/components/LearningCenter";
import FileUpload from "@/components/FileUpload";

const Dashboard = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    translationsUsed: 42,
    gesturesLearned: 28,
    streakDays: 7,
    accuracy: 85
  });

  useEffect(() => {
    // Load user info from localStorage
    const stored = localStorage.getItem("hellenKellerUserInfo");
    if (stored) {
      setUserInfo(JSON.parse(stored));
    }
  }, []);

  const features = [
    {
      id: "translation",
      title: "Real-time Translation",
      description: "Convert between text and sign language",
      icon: MessageSquare,
      color: "from-primary to-primary-hover",
      component: TranslationHub
    },
    {
      id: "hand-recognition",
      title: "Hand Recognition",
      description: "AI-powered gesture recognition and learning",
      icon: Hand,
      color: "from-accent to-accent/80",
      component: HandRecognition
    },
    {
      id: "learning",
      title: "Learning Center",
      description: "Interactive lessons and practice sessions",
      icon: BookOpen,
      color: "from-warning to-warning/80",
      component: LearningCenter
    },
    {
      id: "upload",
      title: "File Analysis",
      description: "Upload images/videos for gesture analysis",
      icon: Upload,
      color: "from-success to-success/80",
      component: FileUpload
    }
  ];

  const renderActiveFeature = () => {
    const feature = features.find(f => f.id === activeFeature);
    if (!feature) return null;
    
    const Component = feature.component;
    return <Component onClose={() => setActiveFeature(null)} />;
  };

  if (activeFeature) {
    return renderActiveFeature();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {userInfo?.name || "User"}!
              </h1>
              <p className="text-muted-foreground">
                Continue your journey in accessible communication
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Heart className="mr-1 h-4 w-4" />
                Helen Keller Platform
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Translations Used</p>
                  <p className="text-2xl font-bold text-primary">{stats.translationsUsed}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-accent/10 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gestures Learned</p>
                  <p className="text-2xl font-bold text-accent">{stats.gesturesLearned}</p>
                </div>
                <Hand className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-success/10 to-success/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Streak Days</p>
                  <p className="text-2xl font-bold text-success">{stats.streakDays}</p>
                </div>
                <Award className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-warning/10 to-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold text-warning">{stats.accuracy}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
                onClick={() => setActiveFeature(feature.id)}
              >
                <CardHeader className="pb-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  >
                    Launch Feature
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Translate</h3>
                    <p className="text-sm text-muted-foreground">Start live translation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-accent/10 p-3">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Community</h3>
                    <p className="text-sm text-muted-foreground">Connect with others</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-success/10 p-3">
                    <Globe className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Resources</h3>
                    <p className="text-sm text-muted-foreground">Learning materials</p>
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

export default Dashboard;