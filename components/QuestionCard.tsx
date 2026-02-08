/**
 * QuestionCard Component
 * Displays different types of game questions with appropriate UI
 */

import { useEffect, useState } from "react";
import { Clock, Volume2 } from "lucide-react";
import {
  WritingQuestion,
  ReadingQuestion,
  ListeningQuestion,
  MathQuestion,
  LogicalQuestion,
  Question,
} from "@/lib/gameTypes";

interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  onAnswer: (answer: string | number) => void;
  timeLimit: number;
  onTimeUp: () => void;
  isAnswered: boolean;
}

export function QuestionCard({
  question,
  index,
  totalQuestions,
  onAnswer,
  timeLimit,
  onTimeUp,
  isAnswered,
}: QuestionCardProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, onTimeUp]);

  // Get time color based on remaining time
  const getTimeColor = () => {
    const percentageLeft = (timeLeft / timeLimit) * 100;
    if (percentageLeft > 50) return "text-green-600";
    if (percentageLeft > 25) return "text-amber-600";
    return "text-red-600";
  };

  const handleSubmit = () => {
    if (question.type === "math") {
      onAnswer(parseInt(userAnswer) || 0);
    } else if (["reading", "listening", "logical"].includes(question.type)) {
      onAnswer(selectedOption ?? -1);
    } else {
      onAnswer(userAnswer);
    }
  };

  const isTimeWarning = timeLeft <= 5;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-neutral-600">
          Question {index + 1} of {totalQuestions}
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isTimeWarning
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span className={`font-bold ${getTimeColor()}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        {question.type === "writing" && (
          <WritingQuestionDisplay
            question={question as WritingQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
          />
        )}

        {question.type === "reading" && (
          <ReadingQuestionDisplay
            question={question as ReadingQuestion}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        )}

        {question.type === "listening" && (
          <ListeningQuestionDisplay
            question={question as ListeningQuestion}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        )}

        {question.type === "math" && (
          <MathQuestionDisplay
            question={question as MathQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
          />
        )}

        {question.type === "logical" && (
          <LogicalQuestionDisplay
            question={question as LogicalQuestion}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={
          isAnswered ||
          (question.type === "writing" && !userAnswer) ||
          (["reading", "listening", "logical"].includes(question.type) &&
            selectedOption === null)
        }
        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isAnswered ? "✓ Answered" : "Check Answer"}
      </button>
    </div>
  );
}

/* ==================== Writing Question ==================== */
function WritingQuestionDisplay({
  question,
  userAnswer,
  setUserAnswer,
}: {
  question: WritingQuestion;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
}) {
  return (
    <div className="text-center space-y-6">
      <h3 className="text-2xl font-bold text-neutral-800">
        {question.prompt}
      </h3>

      {question.skill === "draw" ? (
        <div className="space-y-4">
          <p className="text-neutral-600 italic">
            Use your mouse or touchscreen to draw
          </p>
          <canvas
            id="drawing-canvas"
            className="w-full border-2 border-dashed border-blue-300 rounded-lg bg-white cursor-crosshair"
            style={{ height: "300px" }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-neutral-600">Type below:</p>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:border-blue-600"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

/* ==================== Reading Question ==================== */
function ReadingQuestionDisplay({
  question,
  selectedOption,
  setSelectedOption,
}: {
  question: ReadingQuestion;
  selectedOption: number | null;
  setSelectedOption: (value: number) => void;
}) {
  return (
    <div className="space-y-6">
      {question.image_url && (
        <img
          src={question.image_url}
          alt="Reading context"
          className="w-full rounded-lg max-h-48 object-cover"
        />
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-neutral-700 italic">"{question.text}"</p>
      </div>

      <h3 className="text-xl font-bold text-neutral-800">
        {question.question}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`p-4 rounded-lg font-semibold transition-all ${
              selectedOption === idx
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==================== Listening Question ==================== */
function ListeningQuestionDisplay({
  question,
  selectedOption,
  setSelectedOption,
}: {
  question: ListeningQuestion;
  selectedOption: number | null;
  setSelectedOption: (value: number) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    // Initialize TTS if not already done
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(question.question);
      utterance.rate = 0.8; // Slower for kids
      speechSynthesis.speak(utterance);
      setIsPlaying(true);

      utterance.onend = () => setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
        >
          <Volume2 className="h-5 w-5" />
          {isPlaying ? "Playing..." : "🔊 Listen"}
        </button>
      </div>

      <h3 className="text-xl font-bold text-neutral-800 text-center">
        Which option did you hear?
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`p-4 rounded-lg font-semibold transition-all ${
              selectedOption === idx
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==================== Math Question ==================== */
function MathQuestionDisplay({
  question,
  userAnswer,
  setUserAnswer,
}: {
  question: MathQuestion;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
}) {
  const getOperationSymbol = (op: string) => {
    switch (op) {
      case "addition":
        return "+";
      case "subtraction":
        return "−";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        return "?";
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl">
        <div className="text-6xl font-bold text-neutral-800">
          {question.num1}
        </div>
        <div className="text-5xl text-green-600 font-bold my-2">
          {getOperationSymbol(question.operation)}
        </div>
        <div className="text-6xl font-bold text-neutral-800">
          {question.num2}
        </div>
        <div className="text-4xl text-neutral-400 mt-4">=</div>
        <div className="text-5xl font-bold text-neutral-800 mt-2">?</div>
      </div>

      <div className="space-y-2">
        <label className="block text-neutral-600 font-medium">Your answer:</label>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 text-2xl font-bold border-2 border-green-300 rounded-lg text-center focus:outline-none focus:border-green-600"
          autoFocus
        />
      </div>
    </div>
  );
}

/* ==================== Logical Question ==================== */
function LogicalQuestionDisplay({
  question,
  selectedOption,
  setSelectedOption,
}: {
  question: LogicalQuestion;
  selectedOption: number | null;
  setSelectedOption: (value: number) => void;
}) {
  return (
    <div className="space-y-6">
      {question.image_urls && question.image_urls.length > 0 && (
        <div className="flex gap-4 justify-center flex-wrap">
          {question.image_urls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Logic visual ${idx}`}
              className="max-h-32 rounded-lg"
            />
          ))}
        </div>
      )}

      <h3 className="text-2xl font-bold text-neutral-800 text-center">
        {question.question}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`p-4 rounded-lg font-semibold transition-all text-lg ${
              selectedOption === idx
                ? "bg-orange-600 text-white shadow-lg"
                : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
