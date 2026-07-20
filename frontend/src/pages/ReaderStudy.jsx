// Web viewer powered by NiiVue
// https://niivue.com/docs/
// Allows embedding medical imaging into web pages using React framework

import { useEffect, useState } from "react";
import ImageViewer from "../components/ImageViewer";
import ImageViewerDual from "../components/ImageViewerDual";
import RatingScale from "../components/RatingScale";

import "../styles/reader-study.css";

function ReaderStudy() {
  // Stores the complete study items returned by FastAPI
  // Each study item contains:
  // - an id
  // - a module type
  // - a viewer type
  // - shared question text
  // - one or mroe image objects
  const [questions, setQuestions] = useState([]);

  // Tracks which study question is currently being displayed
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tracks whether the frontend is still waiting for the backend response
  const [loading, setLoading] = useState(true);

  // Stores an error message if the questions cannot be loaded
  const [error, setError] = useState("");

  // Retreive the current study question using its position in the array
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    async function fetchQuestions() {
      try {
        // Clear an old error before attempting another request
        setError("");

        const response = await fetch("http://localhost:8000/api/questions");

        // Read the response body whether the request succeeded or failed
        const data = await response.json();

        // A fetch request does not automatically throw an error for responses such as 404 or 500
        // Need to check response.ok because these errors are quite common with debugging
        if (!response.ok) {
          throw new Error(
            data.detail || "The study questions could not be loaded.",
          );
        }

        // Protect the frontend in case the backend returns the wrong shape
        if (!Array.isArray(data)) {
          throw new Error(
            "The backend returned an invalid study question format.",
          );
        }

        setQuestions(data);
      } catch (fetchError) {
        console.error("unable to load study questions:", fetchError);

        setError(
          fetchError.message ||
            "An unexpected error occurred while loading the study.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  function nextQuestion() {
    // Prevent the index from moving beyond the final study question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previousIndex) => previousIndex + 1);
    }
  }

  function previousQuestion() {
    // Prevent the index from moving below 0
    if (currentIndex > 0) {
      setCurrentIndex((previousIndex) => previousIndex - 1);
    }
  }

  const progressPercent =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Show a loading message only while the request is still running
  if (loading) {
    return (
      <main className="reader-study-page">
        <p className="loading-text">Loading brain scans...</p>
      </main>
    );
  }

  // Show the actual backend or network error instead of leaving the reader stuck on the loading screen
  if (error) {
    return (
      <main className="reader-study-page">
        <div className="study-error">
          <h1>Unable to load the reader study</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  // Handle a valid but empty question list.
  if (!currentQuestion) {
    return (
      <main className="reader-study-page">
        <p className="loading-text">No reader study questions were found.</p>
      </main>
    );
  }

  console.log("Current question:", currentQuestion);

  return (
    <main className="reader-study-page">
      <header className="study-header">
        <div>
          <p className="eyebrow">Reader Study Website</p>
          <h1>Brain Image Scans</h1>
          <p>Review randomized NIfTI brain images.</p>
        </div>

        <div className="study-status-card">
          <span>Progress</span>
          <strong>
            {currentIndex + 1} / {questions.length}
          </strong>
        </div>
      </header>

      <section className="progress-section">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      <section className="study-layout">
        <div className="viewer-container">
          {/* 
            The backend determines which viewer layout this question uses.

            A single viewer requires one image:
            currentQuestion.images[0]

            A dual viewer requires two images:
            currentQuestion.images[0]
            currentQuestion.images[1]
          */}

          {currentQuestion.viewer_type === "single" && (
            <ImageViewer src={currentQuestion.images[0].url} />
          )}

          {currentQuestion.viewer_type === "double" && (
            <ImageViewerDual
              leftSrc={currentQuestion.images[0].url}
              rightSrc={currentQuestion.images[1].url}
            />
          )}

          {/* 
            This message will protect against a module accidentally returning an unsupported viewer type
          */}
          {!["single", "double"].includes(currentQuestion.viewer_type) && (
            <div className="viewer-error">
              Unsupported viewer type: {currentQuestion.viewer_type}
            </div>
          )}
        </div>

        <aside className="info-panel">
          <h2>Study Information</h2>

          <div className="info-row">
            <span>Current Question</span>
            <strong>{currentIndex + 1}</strong>
          </div>

          <div className="info-row">
            <span>Total Questions</span>
            <strong>{questions.length}</strong>
          </div>

          <div className="info-row">
            <span>Module</span>
            <strong>{currentQuestion.module_type}</strong>
          </div>

          <div className="info-row">
            <span>Status</span>
            <strong>In Progress</strong>
          </div>

          <div className="evaluation-card">
            <div className="evaluation-heading">
              <p className="evaluation-eyebrow">Reader response</p>
              <h3>Evaluation</h3>
            </div>

            <fieldset className="evaluation-fieldset">
              <legend className="evaluation-question">
                {currentQuestion.question}
              </legend>

              <p className="evaluation-help">
                Consider overall anatomy, structural detail, and image quality.
              </p>

              <RatingScale />
            </fieldset>
          </div>
        </aside>
      </section>

      <footer className="study-navigation">
        <button onClick={previousQuestion} disabled={currentIndex === 0}>
          Previous
        </button>

        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </button>
      </footer>
    </main>
  );
}
export default ReaderStudy;
