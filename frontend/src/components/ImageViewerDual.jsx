// Dual side by side NiFTi view of 2 ImageViewer.jsx
import ImageViewer from "./ImageViewer";

function ImageViewerDual({ leftSrc, rightSrc }) {
  return (
    <div className="dual-viewer">
      <ImageViewer src={leftSrc} />
      <ImageViewer src={rightSrc} />
    </div>
  );
}

export default ImageViewerDual;
