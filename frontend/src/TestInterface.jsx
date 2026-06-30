// Web viewer powered by NiiVue
// https://niivue.com/docs/
// Allows embedding medical imaging into web pages using React framework

import { useRef, useEffect, useState } from "react";
import { Niivue } from "@niivue/niivue";

function TestInterface() {
  const canvasRef = useRef(null);
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState("");

  // Fetch scan list from brain-scans repo
  useEffect(() => {
    fetch("https://Dragonrider7777.github.io/brain-scans/scans.json")
      .then((res) => res.json())
      .then((data) => {
        setScans(data);
        if (data.length > 0) setSelectedScan(data[0].url);
      })
      .catch((err) => console.error("Failed to load scan list:", err));
  }, []);

  // Load selected scan into NiiVue
  useEffect(() => {
    if (!selectedScan) return;
    const nv = new Niivue();
    nv.attachToCanvas(canvasRef.current);
    nv.loadVolumes([
      { url: selectedScan, name: selectedScan.split("/").pop() },
    ]).catch((err) => console.error("Failed to load scan: ", err));
    return () => nv.destroy?.();
  }, [selectedScan]);

  return (
    <section className="content-section">
      <h1 className="page-title">NiFTI web viewer</h1>
      <p className="page-description">
        A NiFTI image viewer that can be used in browser!
      </p>
      <div>
        <select
          value={selectedScan}
          onChange={(e) => setSelectedScan(e.target.value)}
        >
          {scans.map((scan) => (
            <option key={scan.url} value={scan.url}>
              {scan.name}
            </option>
          ))}
        </select>
        <canvas ref={canvasRef} width={640} height={480} />
      </div>
    </section>
  );
}
export default TestInterface;
