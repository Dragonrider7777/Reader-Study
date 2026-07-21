import RatingScale from "./RatingScale";

function StudyInfo({ studyItems, currentIndex }) {
  // Retreive the current studyItem using its position in the array
  const currentStudyItem = studyItems[currentIndex];

  return (
    <aside className="info-panel">
      <h2>Study Information</h2>

      <div className="info-row">
        <span>Current Study Item</span>
        <strong>{currentIndex + 1}</strong>
      </div>

      <div className="info-row">
        <span>Total Items</span>
        <strong>{studyItems.length}</strong>
      </div>

      <div className="info-row">
        <span>Module</span>
        <strong>{currentStudyItem.module_type}</strong>
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
            {currentStudyItem.studyItem}
          </legend>

          <p className="evaluation-help">
            Consider overall anatomy, structural detail, and image quality.
          </p>

          <RatingScale />
        </fieldset>
      </div>
    </aside>
  );
}

export default StudyInfo;
