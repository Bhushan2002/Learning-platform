"use client";

import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import ReactPlayer from "react-player";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";

const Course = () => {
  const {
    user,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  } = useCourseProgressData();
  
  const playerRef = useRef(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  // Sample quiz data - in a real application, this would come from your API/backend
  const quizQuestions = currentChapter ? [
    {
      id: 1,
      question: `What is the main topic of "${currentChapter.title}"?`,
      options: [
        { id: "a", text: "User Interface Design" },
        { id: "b", text: "User Experience Design" },
        { id: "c", text: "Interaction Design" },
        { id: "d", text: "Visual Design" }
      ],
      correctAnswer: "b"
    },
    {
      id: 2,
      question: "Which of these is NOT typically a UX design deliverable?",
      options: [
        { id: "a", text: "Wireframes" },
        { id: "b", text: "User Personas" },
        { id: "c", text: "Source Code" },
        { id: "d", text: "User Journey Maps" }
      ],
      correctAnswer: "c"
    },
    {
      id: 3,
      question: "What is a key principle discussed in this chapter?",
      options: [
        { id: "a", text: "Consistency" },
        { id: "b", text: "Complexity" },
        { id: "c", text: "Customization" },
        { id: "d", text: "Creativity" }
      ],
      correctAnswer: "a"
    }
  ] : [];

  const handleProgress = ({ played }: { played: number }) => {
    if (
      played >= 0.8 &&
      !hasMarkedComplete &&
      currentChapter &&
      currentSection &&
      userProgress?.sections &&
      !isChapterCompleted()
    ) {
      setHasMarkedComplete(true);
      updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
    }
  };

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const handleQuizSubmit = () => {
    // Calculate score
    let correctAnswers = 0;
    quizQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers += 1;
      }
    });
    
    const calculatedScore = Math.round((correctAnswers / quizQuestions.length) * 100);
    setScore(calculatedScore);
    setQuizPassed(calculatedScore >= 70); // 70% passing threshold
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setScore(0);
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course || !userProgress) return <div>Error loading course</div>;

  return (
    <div className="course">
      <div className="course__container">
        <div className="course__breadcrumb">
          <div className="course__path">
            {course.title} / {currentSection?.sectionTitle} /{" "}
            <span className="course__current-chapter">
              {currentChapter?.title}
            </span>
          </div>
          <h2 className="course__title">{currentChapter?.title}</h2>
          <div className="course__header">
            <div className="course__instructor">
              <Avatar className="course__avatar">
                <AvatarImage alt={course.teacherName} />
                <AvatarFallback className="course__avatar-fallback">
                  {course.teacherName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="course__instructor-name">
                {course.teacherName}
              </span>
            </div>
          </div>
        </div>

        <Card className="course__video">
          <CardContent className="course__video-container">
            {currentChapter?.video ? (
              <ReactPlayer
                ref={playerRef}
                url={typeof currentChapter.video === "string" ? currentChapter.video : URL.createObjectURL(currentChapter.video)}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                    },
                  },
                }}
              />
            ) : (
              <div className="course__no-video">
                No video available for this chapter.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="course__content">
          <Tabs defaultValue="Notes" className="course__tabs">
            <TabsList className="course__tabs-list">
              {/* <TabsTrigger className="course__tab" value="Notes">
                Notes
              </TabsTrigger> */}
              <TabsTrigger className="course__tab" value="Resources">
                Resources
              </TabsTrigger>
              <TabsTrigger className="course__tab" value="Quiz">
                Quiz
              </TabsTrigger>
            </TabsList>

            {/* <TabsContent className="course__tab-content" value="Notes">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Notes Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {currentChapter?.content}
                </CardContent>
              </Card>
            </TabsContent> */}

            <TabsContent className="course__tab-content" value="Resources">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Resources Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {/* Add resources content here */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="course__tab-content" value="Quiz">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Chapter Quiz</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {quizSubmitted ? (
                    <div className="quiz-results">
                      <Alert className={quizPassed ? "bg-green-50 mb-4" : "bg-red-50 mb-4"}>
                        <div className="flex items-center gap-2">
                          {quizPassed ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <XCircle className="text-red-500" size={20} />
                          )}
                          <AlertTitle className={quizPassed ? "text-green-700" : "text-red-700"}>
                            {quizPassed ? "Quiz Passed!" : "Quiz Failed"}
                          </AlertTitle>
                        </div>
                        <AlertDescription className="mt-2">
                          You scored {score}%. {quizPassed 
                            ? "Great job! You have demonstrated understanding of this chapter's material." 
                            : "You need at least 70% to pass. Review the chapter content and try again."}
                        </AlertDescription>
                      </Alert>
                      
                      {/* Show the correct answers */}
                      <div className="quiz-review mt-6">
                        <h3 className="font-medium text-lg mb-4">Review Your Answers</h3>
                        {quizQuestions.map(question => {
                          const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
                          return (
                            <div key={question.id} className="mb-6 p-4 border rounded">
                              <div className="flex items-start gap-2">
                                {isCorrect ? (
                                  <CheckCircle className="text-green-500 mt-1" size={16} />
                                ) : (
                                  <XCircle className="text-red-500 mt-1" size={16} />
                                )}
                                <div>
                                  <p className="font-medium">{question.question}</p>
                                  <p className="mt-2 text-sm">
                                    Your answer: {question.options.find(opt => opt.id === selectedAnswers[question.id])?.text || "Not answered"}
                                  </p>
                                  {!isCorrect && (
                                    <p className="mt-1 text-sm text-green-700">
                                      Correct answer: {question.options.find(opt => opt.id === question.correctAnswer)?.text}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Button onClick={resetQuiz} className="mt-4">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="quiz-questions">
                      <p className="mb-6">Complete this quiz to test your understanding of this chapter. You need 70% to pass.</p>
                      
                      {quizQuestions.map(question => (
                        <div key={question.id} className="mb-6">
                          <h3 className="text-base font-medium mb-3">{question.question}</h3>
                          <RadioGroup 
                            value={selectedAnswers[question.id]} 
                            onValueChange={(value) => handleAnswerSelect(question.id, value)}
                            className="space-y-2"
                          >
                            {question.options.map(option => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={`q${question.id}-${option.id}`} />
                                <Label htmlFor={`q${question.id}-${option.id}`} className="cursor-pointer">
                                  {option.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                      
                      <Button
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                        className="mt-4 mb-5 hover:bg-blue-800 transition-colors duration-200 bg-blue-700" 
                      >
                        Submit Quiz
                      </Button>
                      
                      {Object.keys(selectedAnswers).length < quizQuestions.length && (
                        <p className="text-sm text-gray-500 mt-2">
                          Please answer all questions before submitting
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="course__instructor-card">
            <CardContent className="course__instructor-info">
              <div className="course__instructor-header">
                <Avatar className="course__instructor-avatar">
                  <AvatarImage alt={course.teacherName} />
                  <AvatarFallback className="course__instructor-avatar-fallback">
                    {course.teacherName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="course__instructor-details">
                  <h4 className="course__instructor-name">
                    {course.teacherName}
                  </h4>
                  <p className="course__instructor-title">Senior UX Designer</p>
                </div>
              </div>
              <div className="course__instructor-bio">
                <p>
                  A seasoned Senior UX Designer with over 15 years of experience
                  in creating intuitive and engaging digital experiences.
                  Expertise in leading UX design projects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Course;