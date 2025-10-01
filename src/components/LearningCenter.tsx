import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Star,
  Clock,
  Users,
  Trophy,
  GitBranch
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LearningCenterProps {
  onClose: () => void;
}

const LearningCenter: React.FC<LearningCenterProps> = ({ onClose }) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState({
    level: 2,
    totalXP: 1250,
    currentStreak: 7,
    completedLessons: 24
  });
  const { toast } = useToast();

  const courses = [
    {
      id: "basics",
      title: "ASL Basics",
      description: "Learn fundamental American Sign Language signs",
      level: "Beginner",
      duration: "2 weeks",
      progress: 60,
      lessons: 12,
      completed: 7,
      color: "from-primary to-primary-hover",
      skills: ["Alphabet", "Numbers", "Basic Greetings", "Family Signs"]
    },
    {
      id: "conversation",
      title: "Conversational ASL",
      description: "Build your conversation skills and fluency",
      level: "Intermediate",
      duration: "4 weeks",
      progress: 25,
      lessons: 20,
      completed: 5,
      color: "from-accent to-accent/80",
      skills: ["Questions", "Emotions", "Daily Activities", "Time & Date"]
    },
    {
      id: "advanced",
      title: "Advanced Expressions",
      description: "Master complex expressions and storytelling",
      level: "Advanced",
      duration: "6 weeks",
      progress: 0,
      lessons: 16,
      completed: 0,
      color: "from-warning to-warning/80",
      skills: ["Storytelling", "Poetry", "Complex Grammar", "Cultural Context"]
    },
    {
      id: "github-data",
      title: "GitHub ASL Dataset",
      description: "Learn from comprehensive sign language datasets",
      level: "Research",
      duration: "Ongoing",
      progress: 15,
      lessons: 50,
      completed: 8,
      color: "from-success to-success/80",
      skills: ["ML Training", "Data Analysis", "Pattern Recognition", "AI Models"]
    }
  ];

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first lesson", earned: true },
    { id: 2, title: "Week Warrior", description: "Study for 7 consecutive days", earned: true },
    { id: 3, title: "Sign Master", description: "Learn 50 different signs", earned: false },
    { id: 4, title: "Perfect Practice", description: "Score 100% on 5 lessons", earned: false }
  ];

  const startLesson = (courseId: string) => {
    toast({
      title: "Lesson Started",
      description: "Welcome to your ASL learning session!"
    });
    // In a real app, this would navigate to the lesson interface
  };

  const openGitHubDataset = () => {
    toast({
      title: "GitHub Integration",
      description: "Accessing ASL datasets from GitHub repositories"
    });
    // In a real app, this would integrate with GitHub API to fetch ASL datasets
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose} className="h-10 w-10 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Learning Center</h1>
              <p className="text-muted-foreground">Master sign language with interactive lessons</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <BookOpen className="mr-1 h-4 w-4" />
            Educational
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* User Progress Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
                    <span className="text-xl font-bold text-white">{userProgress.level}</span>
                  </div>
                  <p className="text-sm font-medium">Level {userProgress.level}</p>
                  <p className="text-xs text-muted-foreground">{userProgress.totalXP} XP</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Level {userProgress.level + 1}</span>
                    <span>70%</span>
                  </div>
                  <Progress value={70} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-bold text-primary">{userProgress.currentStreak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-bold text-accent">{userProgress.completedLessons}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`flex items-center gap-3 rounded-lg p-2 ${
                        achievement.earned ? 'bg-success/10' : 'bg-muted/50'
                      }`}
                    >
                      <div className={`rounded-full p-1 ${
                        achievement.earned ? 'bg-success text-success-foreground' : 'bg-muted-foreground/20'
                      }`}>
                        <Trophy className="h-3 w-3" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${
                          achievement.earned ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {achievement.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* GitHub Integration Banner */}
            <Card className="mb-6 border-0 bg-gradient-to-r from-success/10 to-accent/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-success/20 p-3">
                      <GitBranch className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">GitHub ASL Datasets</h3>
                      <p className="text-sm text-muted-foreground">
                        Access comprehensive sign language datasets from research repositories
                      </p>
                    </div>
                  </div>
                  <Button onClick={openGitHubDataset} variant="outline">
                    Explore Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  className="group cursor-pointer border-0 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${course.color} mb-4`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="mt-1">{course.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.lessons} lessons
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.completed}/{course.lessons} lessons</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Skills you'll learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => startLesson(course.id)}
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      variant={course.progress > 0 ? "default" : "outline"}
                    >
                      {course.progress > 0 ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Start Course
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily Challenge */}
            <Card className="mt-6 border-0 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Daily Challenge
                </CardTitle>
                <CardDescription>Complete today's challenge to earn bonus XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Practice 10 Number Signs</h4>
                    <p className="text-sm text-muted-foreground">Master numbers 1-10 in ASL</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={30} className="w-32" />
                      <span className="text-sm text-muted-foreground">3/10 completed</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">+50</p>
                    <p className="text-xs text-muted-foreground">XP Reward</p>
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

export default LearningCenter;