// Component for the web browser supported NiFTI file viewer
// Powered by Niivue
// https://niivue.com/docs/
import { useRef, useEffect } from "react";
// Change to import { Niivue, SLICE_TYPE } from "@niivue/niivue" if using the viewer toolbar
import { Niivue } from "@niivue/niivue";

function ImageViewer({ src }) {
  const canvasRef = useRef(null);
  const nvRef = useRef(null);

  useEffect(() => {
    if (!src || !canvasRef.current) return;

    async function loadImage() {
      const nv = new Niivue({
        backColor: [0, 0, 0, 1],
        show3Dcrosshair: true,
      });

      nv.attachToCanvas(canvasRef.current);

      await nv.loadVolumes([
        {
          // url: currentImage.url,
          url: src,
        },
      ]);

      // Default slice type rendering
      // nv.setSliceType(SLICE_TYPE.MULTIPLANAR);

      nvRef.current = nv;
    }

    loadImage();
  }, [src]);

  /* Function to set view to be a specific slice type
  * Options consist of:
  * - Axial
  * - Coronal
  * - Sagittal
  * - Multiplanar
  * - 3D / Render

  function setView(sliceType) {
    if (!nvRef.current) return;
    nvRef.current.setSliceType(sliceType);
  }
  
  function resetViewer() {
    if (!nvRef.current || !src) return;

    nvRef.current.loadVolumes([
      {
        url: src,
      },
    ]);
  }
  */

  return (
    <div className="viewer-panel">
      <div className="panel-header">
        <div>
          <h2>Image Viewer</h2>
        </div>
      </div>
      <canvas ref={canvasRef} height={520} width={720} />
    </div>
  );
}

export default ImageViewer;
