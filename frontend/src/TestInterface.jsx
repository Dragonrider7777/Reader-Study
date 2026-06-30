// Web viewer powered by NiiVue
// https://niivue.com/docs/
// Allows embedding medical imaging into web pages using React framework

import { useRef, useEffect } from "react";
import { Niivue } from "@niivue/niivue";

function TestInterface() {
  const NiiVue = ({ imageUrl }) => {
    const canvas = useRef();
    const nvRef = useRef();
    useEffect(() => {
      const volumeList = [
        {
          url: imageUrl,
        },
      ];
      async function setupAndLoad() {
        const nv = new Niivue();
        nv.attachToCanvas(canvas.current);
        await nv.loadVolumes(volumeList);
        nvRef.current = nv;
      }
      setupAndLoad();
    }, [imageUrl]);

    return <canvas ref={canvas} height={480} width={640} />;
  };

  return (
    <section className="content-section">
      <h1 className="page-title">NiFTI web viewer</h1>
      <p className="page-description">
        A NiFTI image viewer that can be used in browser!
      </p>
      <NiiVue imageUrl=
    </section>
  );
}
export default TestInterface;
