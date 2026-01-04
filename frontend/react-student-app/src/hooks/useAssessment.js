// src/hooks/useAssessment.js (Conceptual React Custom Hook)

import { useState, useCallback } from 'react';
import axios from '../api/axiosInstance'; // Assuming you set up an authenticated Axios instance

const useAssessment = () => {
  const [attempt, setAttempt] = useState(null); // Stores attempt_id, duration, questions
  const [answers, setAnswers] = useState({}); // Stores user's current answers
  const [error, setError] = useState(null);

  /**
   * 1. Start Exam: POST /api/student/assessments/{examId}/start/
   */
  const startExam = useCallback(async (examId) => {
    try {
      const response = await axios.post(`/student/assessments/${examId}/start/`);
      const data = response.data;
      
      setAttempt({
        id: data.attempt_id,
        duration: data.exam_duration, // Time in minutes
        questions: data.questions,
      });
      // Initialize answers state based on questions
      const initialAnswers = data.questions.reduce((acc, q) => ({ ...acc, [q.id]: '' }), {});
      setAnswers(initialAnswers);

    } catch (err) {
      setError(err.response?.data?.detail || "Could not start exam.");
    }
  }, []);

  /**
   * 2. Update Local Answer State
   */
  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  }, []);

  /**
   * 3. Submit Exam: POST /api/student/assessments/{attemptId}/submit/
   */
  const submitExam = useCallback(async (attemptId, currentAnswers) => {
    // Transform the 'answers' state into the Django submission payload format
    const submissionData = Object.keys(currentAnswers).map(questionId => ({
      question_id: parseInt(questionId),
      user_answer: currentAnswers[questionId],
    }));

    try {
      const response = await axios.post(`/student/assessments/${attemptId}/submit/`, {
        submissions: submissionData,
      });
      
      // Clear state and show results (if show_score_immediately is true)
      setAttempt(null); 
      setAnswers({});
      return response.data; // Return the score/status
      
    } catch (err) {
      setError("Submission failed or timed out.");
      throw err;
    }
  }, []);

  return { attempt, answers, error, startExam, handleAnswerChange, submitExam };
};