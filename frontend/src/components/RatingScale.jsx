// Reusable rating scale component
import { useState } from "react";
import Rating from "@mui/material/Rating";
import CircleIcon from "@mui/icons-material/Circle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

function RatingScale() {
  // Each number corresponds to one possible reader response
  const labels = {
    1: "Completely Different",
    2: "Different",
    3: "Some Similarities",
    4: "Many Similarities",
    5: "Almost Identical",
    6: "Identical",
  };

  // Starts with no answer selected
  // Uses null because it does not bias the reader toward a specific response before they make a choice
  const [value, setValue] = useState(null);

  // Stores the circle currently being hovered over
  // Uses -1 because the reader begins not hovering over any circle
  const [hover, setHover] = useState(-1);

  // Show the hover label while hovering
  // Otherwise, show the selected label
  const displayedValue = hover !== -1 ? hover : value;

  return (
    <div className="rating-scale">
      {/* Labels explain what the two ends of the scale mean */}
      <div className="rating-endpoints">
        <span>Completely different</span>
        <span>Identical</span>
      </div>

      <Rating
        className="smiliarity-rating"
        // This component is controlled by React state
        value={value}
        // Uses filled and empty circles instead of default stars
        icon={<CircleIcon />}
        emptyIcon={<CircleOutlinedIcon />}
        // Reader can choose between 6 levels of similarity
        max={6}
        // Accessibility text for screen readers
        getLabelText={(ratingValue) => labels[ratingValue]}
        // Save the selected answer
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        // Temporarily preview a label when hovering
        onChangeActive={(event, newHover) => {
          setHover(newHover);
        }}
        sx={{ color: "#4f6df5" }}
      />

      {/* Gives the selected value in its own clear area */}
      <div className="rating-feedback" aria-live="polite">
        {displayedValue ? (
          <>
            <span className="rating-feedback-title">
              {hover !== -1 ? "Preview" : "Selected"}
            </span>

            <strong>{labels[displayedValue]}</strong>
          </>
        ) : (
          <span className="rating-prompt">
            Select the response that best matches your evaluation.
          </span>
        )}
      </div>
    </div>
  );
}

export default RatingScale;
