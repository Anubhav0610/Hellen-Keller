import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Heart, Globe } from "lucide-react";

const UserInput = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    hearingStatus: "",
    preferences: "",
    goals: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    // Store user info in localStorage for persistence
    localStorage.setItem("hellenKellerUserInfo", JSON.stringify(userInfo));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-16 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary)/0.1)_25%,transparent_25%),linear-gradient(-45deg,hsl(var(--primary)/0.1)_25%,transparent_25%)] bg-[length:20px_20px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-lg font-semibold">
              <Heart className="mr-2 h-5 w-5" />
              Helen Keller Platform
            </Badge>
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Breaking Communication
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Barriers</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Advanced AI-powered platform connecting deaf and mute communities with innovative 
            sign language translation, hand recognition, and learning resources.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Inclusive Design</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
              <Globe className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Real-time Translation</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information Form */}
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">
              Welcome to Your Journey
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Help us personalize your experience for better accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={userInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hearing-status" className="text-sm font-medium">
                Hearing Status
              </Label>
              <select
                id="hearing-status"
                value={userInfo.hearingStatus}
                onChange={(e) => handleInputChange("hearingStatus", e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select your hearing status</option>
                <option value="deaf">Deaf</option>
                <option value="hard-of-hearing">Hard of Hearing</option>
                <option value="hearing">Hearing</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences" className="text-sm font-medium">
                Communication Preferences
              </Label>
              <Textarea
                id="preferences"
                placeholder="Tell us about your preferred communication methods (ASL, written text, etc.)"
                value={userInfo.preferences}
                onChange={(e) => handleInputChange("preferences", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals" className="text-sm font-medium">
                Learning Goals
              </Label>
              <Textarea
                id="goals"
                placeholder="What would you like to achieve with this platform?"
                value={userInfo.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleContinue}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/90 transition-all duration-300"
              disabled={!userInfo.name || !userInfo.email}
            >
              Continue to Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Your information helps us provide a more personalized experience
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserInput;