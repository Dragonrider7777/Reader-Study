// Web viewer powered by NiiVue
// https://niivue.com/docs/
// Allows embedding medical imaging into web pages using React framework

import { useEffect, useState } from "react";
import ImageViewer from "../components/ImageViewer";
import RatingScale from "../components/RatingScale";
import "../styles/reader-study.css";

function ReaderStudy() {
  // Determines which images are in the viewer pool
  const [images, setImages] = useState([]);
  // Index of the image brain scan being currently displayed
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage = images[currentIndex];

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch("http://localhost:8000/api/images");
      const data = await response.json();
      setImages(data);
    }
    fetchImages();
  }, []);

  function nextImage() {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function previousImage() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  const progressPercent =
    images.length > 0 ? ((currentIndex + 1) / images.length) * 100 : 0;

  if (images.length === 0) {
    return (
      <main className="reader-study-page">
        <p className="loading-text">Loading brain scans...</p>
      </main>
    );
  }

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
            {currentIndex + 1} / {images.length}
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
        <ImageViewer src={currentImage.url} />

        <aside className="info-panel">
          <h2>Study Information</h2>

          <div className="info-row">
            <span>Current Image</span>
            <strong>{currentIndex + 1}</strong>
          </div>

          <div className="info-row">
            <span>Total Images</span>
            <strong>{images.length}</strong>
          </div>

          <div className="info-row">
            <span>Model</span>
            <strong>TBD</strong>
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
                How similar are these images?
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
        <button onClick={previousImage} disabled={currentIndex === 0}>
          Previous
        </button>

        <button
          onClick={nextImage}
          disabled={currentIndex === images.length - 1}
        >
          Next
        </button>
      </footer>
    </main>
  );
}
export default ReaderStudy;
