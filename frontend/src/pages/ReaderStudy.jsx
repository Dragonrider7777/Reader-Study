/* eslint-disable react-hooks/static-components */
// Web viewer powered by NiiVue
// https://niivue.com/docs/
// Allows embedding medical imaging into web pages using React framework

import { useRef, useEffect, useState } from "react";
import { Niivue } from "@niivue/niivue";
import "../styles/reader-study.css";

function ReaderStudy() {
  // Determines which images are in the viewer pool
  const [images, setImages] = useState([]);
  // Index of the image brain scan being currently displayed
  const [currentIndex, setCurrentIndex] = useState(0);

  const canvasRef = useRef(null);
  const nvRef = useRef(null);

  const currentImage = images[currentIndex];

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch("http://localhost:8000/api/images");
      const data = await response.json();
      setImages(data);
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (!currentImage) return;

    async function loadImage() {
      const nv = new Niivue();

      nv.attachToCanvas(canvasRef.current);

      await nv.loadVolumes([
        {
          url: currentImage.url,
        },
      ]);

      nvRef.current = nv;
    }

    loadImage();
  }, [currentImage]);

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
        <div className="viewer-panel">
          <div className="panel-header">
            <div>
              <h2>Image Viewer</h2>
              <p>{currentImage.filename}</p>
            </div>

            <span className="badge">NIfTI</span>
          </div>

          <canvas ref={canvasRef} height={520} width={720} />
        </div>

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

          <div className="evaluation-placeholder">
            <h3>Evaluation</h3>
            <p>Ratings, confidence scores, and comments will go here.</p>
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
