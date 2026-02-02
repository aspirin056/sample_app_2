"use client";

import { useCallback, useMemo, useState } from "react";
import {
  buildQuiz,
  getWrongChoices,
  type QuizQuestion,
} from "./lib/quiz-data";

type QuizState = "playing" | "finished";

type QuestionState = {
  question: QuizQuestion;
  choices: string[];
  hadWrongAttempt: boolean;
};

function buildInitialQuestionState(q: QuizQuestion): QuestionState {
  const wrong = getWrongChoices(q.correctEn, q.correctKr, q.direction, 3);
  const correctChoice =
    q.direction === "kr-to-en" ? q.correctEn : q.correctKr;
  const choices = shuffleArray([correctChoice, ...wrong]);
  return {
    question: q,
    choices,
    hadWrongAttempt: false,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function QuizPage() {
  const [quiz] = useState(() => buildQuiz(12));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(() =>
    quiz.map(buildInitialQuestionState)
  );
  const [score, setScore] = useState(0);
  const [state, setState] = useState<QuizState>("playing");

  const current = questionStates[currentIndex];
  const total = quiz.length;

  const handleChoice = useCallback(
    (choice: string) => {
      if (!current) return;
      const { question } = current;
      const correctChoice =
        question.direction === "kr-to-en" ? question.correctEn : question.correctKr;

      if (choice === correctChoice) {
        setScore((s: number) => s + 1);
        if (currentIndex + 1 >= total) {
          setState("finished");
        } else {
          setCurrentIndex((i: number) => i + 1);
        }
        return;
      }

      // Wrong: remove this choice and mark that we needed a correction
      setQuestionStates((prev: QuestionState[]) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          choices: next[currentIndex].choices.filter((c: string) => c !== choice),
          hadWrongAttempt: true,
        };
        return next;
      });
    },
    [current, currentIndex, total]
  );

  const correctedAnswers = useMemo((): { prompt: string; correct: string }[] => {
    return questionStates
      .filter((qs: QuestionState) => qs.hadWrongAttempt)
      .map((qs: QuestionState) => ({
        prompt: qs.question.prompt,
        correct:
          qs.question.direction === "kr-to-en"
            ? qs.question.correctEn
            : qs.question.correctKr,
      }));
  }, [questionStates]);

  if (state === "finished") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">
            🎉 Quiz complete!
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Your score: <strong>{score}</strong> out of {total}
          </p>
          {correctedAnswers.length > 0 && (
            <div className="text-left border-t border-amber-200 pt-6 mt-6">
              <h2 className="text-xl font-bold text-amber-800 mb-3">
                📝 Corrected answers
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Here are the right answers for the questions you had to try again:
              </p>
              <ul className="space-y-2">
                {correctedAnswers.map((item: { prompt: string; correct: string }, i: number) => (
                  <li
                    key={i}
                    className="bg-amber-50 rounded-xl px-4 py-3 text-gray-800"
                  >
                    <span className="font-medium">{item.prompt}</span>
                    <br />
                    <span className="text-amber-700 font-bold">
                      → {item.correct}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 px-8 py-3 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const { question, choices } = current;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-xl font-bold text-amber-800 text-center mb-4">
          📅 Months of the Year Quiz
        </h1>
        <div className="text-center mb-6">
          <p className="text-amber-700 font-medium">
            Question {currentIndex + 1} of {total}
          </p>
          <p className="text-2xl font-bold text-amber-800 mt-2">
            {question.prompt}
          </p>
        </div>

        <div className="space-y-3">
          {choices.map((choice: string) => (
            <button
              key={choice}
              type="button"
              onClick={() => handleChoice(choice)}
              className="w-full py-4 px-4 text-lg font-medium rounded-2xl bg-amber-50 text-amber-900 border-2 border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition"
            >
              {choice}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          If your answer is wrong, that choice will disappear. Try again!
        </p>
      </div>
    </div>
  );
}
