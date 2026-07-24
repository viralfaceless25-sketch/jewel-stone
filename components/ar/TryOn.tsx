"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { tryOnTargets, type TryOnTarget } from "@/lib/ar/tryon-targets";
import styles from "./try-on.module.css";

type ThreeCtx = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene & { __clone?: THREE.Group };
  camera: THREE.OrthographicCamera;
  piece: THREE.Group | null;
  baseSize: number;
};

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

type Status = "idle" | "starting" | "running" | "error";

export function TryOn({ initialSlug }: { initialSlug?: string }) {
  const [target, setTarget] = useState<TryOnTarget | null>(
    tryOnTargets.find((t) => t.slug === initialSlug) ?? tryOnTargets[0] ?? null,
  );
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [detected, setDetected] = useState(false);
  const [debug, setDebug] = useState("");
  const lastTsRef = useRef(0);
  const frameRef = useRef(0);
  const debugRef = useRef("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<{ type: "hand" | "face"; detect: (v: HTMLVideoElement, t: number) => unknown } | null>(null);
  const threeRef = useRef<ThreeCtx | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarkerRef.current = null;
    setStatus("idle");
    setDetected(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  // ── set up the three.js overlay once ──
  const setupThree = useCallback((w: number, h: number) => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    const scene = new THREE.Scene();
    // Screen-space ortho camera: (0,0) top-left, +y down.
    const camera = new THREE.OrthographicCamera(0, w, 0, h, -2000, 2000);
    camera.position.z = 1000;
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(0.3, -0.6, 1);
    scene.add(key);
    threeRef.current = { renderer, scene, camera, piece: null, baseSize: 1 };
  }, []);

  // ── load the selected GLB, normalised to a unit size ──
  const loadPiece = useCallback((model: string) => {
    const t = threeRef.current;
    if (!t) return;
    if (t.piece) { t.scene.remove(t.piece); t.piece = null; }
    if (t.scene.__clone) { t.scene.remove(t.scene.__clone); t.scene.__clone = undefined; }
    new GLTFLoader().load(model, (gltf) => {
      const group = gltf.scene;
      const box = new THREE.Box3().setFromObject(group);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      group.position.sub(center); // centre at origin
      const wrap = new THREE.Group();
      wrap.add(group);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      threeRef.current!.baseSize = maxDim;
      threeRef.current!.piece = wrap;
      t.scene.add(wrap);
    });
  }, []);

  const start = useCallback(async () => {
    if (!target) return;
    setStatus("starting");
    setMessage("Loading camera and tracking…");
    try {
      const { FilesetResolver, HandLandmarker, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM);

      // GPU delegate is faster but fails on some mobile browsers (iOS Safari);
      // fall back to CPU so tracking still works everywhere.
      if (target.mode === "hand") {
        const make = (delegate: "GPU" | "CPU") =>
          HandLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: HAND_MODEL, delegate },
            runningMode: "VIDEO",
            numHands: 1,
          });
        const hl = await make("GPU").catch(() => make("CPU"));
        landmarkerRef.current = { type: "hand", detect: (v, ts) => hl.detectForVideo(v, ts) };
      } else {
        const make = (delegate: "GPU" | "CPU") =>
          FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate },
            runningMode: "VIDEO",
            numFaces: 1,
          });
        const fl = await make("GPU").catch(() => make("CPU"));
        landmarkerRef.current = { type: "face", detect: (v, ts) => fl.detectForVideo(v, ts) };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      setupThree(w, h);
      loadPiece(target.model);
      setStatus("running");
      setMessage("");
      renderLoop();
    } catch (err) {
      const e = err as Error;
      setStatus("error");
      setMessage(
        e.name === "NotAllowedError"
          ? "Camera access was denied. Allow the camera and try again."
          : "Could not start the camera. Use a supported phone/browser and try again.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, setupThree, loadPiece]);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const lm = landmarkerRef.current;
    const t = threeRef.current;
    if (!video || !lm || !t || !target) return;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (video.readyState < 2 || video.videoWidth === 0) return;
      const w = t.camera.right;
      const h = t.camera.bottom;
      const mirror = target.facingMode === "user";

      // detectForVideo needs a strictly-increasing timestamp or it throws.
      const ts = Math.max(lastTsRef.current + 1, Math.round(performance.now()));
      lastTsRef.current = ts;

      let result: {
        landmarks?: { x: number; y: number; z: number }[][];
        faceLandmarks?: { x: number; y: number; z: number }[][];
      } = {};
      try {
        result = lm.detect(video, ts) as typeof result;
      } catch (err) {
        debugRef.current = "detect error: " + (err as Error).message.slice(0, 60);
      }
      const px = (nx: number) => (mirror ? (1 - nx) : nx) * w;
      const py = (ny: number) => ny * h;

      const landmarks = lm.type === "hand" ? result.landmarks?.[0] : result.faceLandmarks?.[0];
      const bodySeen = Boolean(landmarks);
      let placed = false;
      if (landmarks && t.piece) {
        placed = lm.type === "hand"
          ? placeOnHand(t, landmarks, px, py, target)
          : placeOnFace(t, landmarks, px, py, target);
      }
      if (t.piece) t.piece.visible = placed;
      setDetected(bodySeen && placed);

      frameRef.current++;
      if (frameRef.current % 15 === 0) {
        setDebug(`${lm.type === "hand" ? "hand" : "face"}: ${bodySeen ? "detected" : "not found"}${t.piece ? "" : " · loading piece…"}${debugRef.current ? " · " + debugRef.current : ""}`);
      }
      t.renderer.render(t.scene, t.camera);
    };
    loop();
  }, [target]);

  // Restart tracking cleanly when the piece switches (mode/camera may change).
  const pick = (next: TryOnTarget) => {
    const wasRunning = status === "running" || status === "starting";
    stop();
    setTarget(next);
    if (wasRunning) setTimeout(() => start(), 60);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <video ref={videoRef} className={`${styles.video} ${target?.facingMode === "user" ? styles.mirror : ""}`} playsInline muted />
        <canvas ref={canvasRef} className={`${styles.canvas} ${target?.facingMode === "user" ? styles.mirror : ""}`} />

        {status !== "running" ? (
          <div className={styles.overlay}>
            {status === "error" ? (
              <>
                <p className={styles.msg}>{message}</p>
                <button className={styles.btn} onClick={() => start()}>Try again</button>
              </>
            ) : status === "starting" ? (
              <p className={styles.msg}>{message}</p>
            ) : (
              <>
                <p className={styles.hint}>
                  {target?.mode === "hand"
                    ? "Point the rear camera at your hand, fingers spread, facing the lens."
                    : "Face the front camera straight on in good light."}
                </p>
                <button className={styles.btn} onClick={() => start()}>Start camera</button>
              </>
            )}
          </div>
        ) : (
          <>
            <span className={styles.beta}>Virtual try-on · beta</span>
            {!detected ? (
              <p className={styles.tracking}>
                {target?.mode === "hand" ? "Show your hand, fingers spread…" : "Looking for your face…"}
              </p>
            ) : null}
            {debug ? <span className={styles.debug}>{debug}</span> : null}
            <button className={`${styles.btn} ${styles.stopBtn}`} onClick={stop}>Stop</button>
          </>
        )}
      </div>

      <div className={styles.picker} role="tablist" aria-label="Choose a piece to try on">
        {tryOnTargets.map((t) => (
          <button
            key={t.slug}
            type="button"
            role="tab"
            className={`${styles.chip} ${target?.slug === t.slug ? styles.chipOn : ""}`}
            aria-selected={target?.slug === t.slug}
            onClick={() => pick(t)}
          >
            {t.name}
            <span>{t.mode === "hand" ? "on hand" : "on face"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function hideClone(t: ThreeCtx) {
  if (t.scene.__clone) t.scene.__clone.visible = false;
}

// Ring → base of the ring finger; bracelet → wrist. Scale to finger/wrist width.
function placeOnHand(
  t: ThreeCtx,
  L: { x: number; y: number }[],
  px: (n: number) => number,
  py: (n: number) => number,
  target: TryOnTarget,
): boolean {
  if (!t.piece) return false;
  hideClone(t);
  if (target.placement === "wrist") {
    // wrist = landmark 0; width ≈ distance(0, 5)
    const cx = px(L[0].x), cy = py(L[0].y);
    const width = dist(px(L[5].x), py(L[5].y), px(L[17].x), py(L[17].y)) * 1.5;
    applyTransform(t, cx, cy, width, Math.atan2(py(L[9].y) - cy, px(L[9].x) - cx) + Math.PI / 2);
    return true;
  }
  // ring finger base: between MCP(13) and PIP(14)
  const ax = px(L[13].x), ay = py(L[13].y);
  const bx = px(L[14].x), by = py(L[14].y);
  const cx = (ax + bx) / 2, cy = (ay + by) / 2;
  const fingerWidth = dist(px(L[13].x), py(L[13].y), px(L[9].x), py(L[9].y)) * 0.85;
  const angle = Math.atan2(by - ay, bx - ax) - Math.PI / 2;
  applyTransform(t, cx, cy, fingerWidth, angle);
  return true;
}

// Earrings → both earlobes; pendant/necklace → below the chin. Scale to face width.
function placeOnFace(
  t: ThreeCtx,
  L: { x: number; y: number }[],
  px: (n: number) => number,
  py: (n: number) => number,
  target: TryOnTarget,
): boolean {
  if (!t.piece) return false;
  const leftEar = L[234], rightEar = L[454], chin = L[152], forehead = L[10];
  if (!leftEar || !rightEar || !chin) return false;
  const faceWidth = dist(px(leftEar.x), py(leftEar.y), px(rightEar.x), py(rightEar.y));

  if (target.placement === "ears") {
    // Show a copy at each earlobe (slightly below the ear landmark).
    const drop = faceWidth * 0.12;
    const size = faceWidth * 0.22;
    // primary piece at right ear, mirror clone handled by second render pass
    placeTwo(t, px(leftEar.x), py(leftEar.y) + drop, px(rightEar.x), py(rightEar.y) + drop, size);
    return true;
  }
  // necklace / pendant: centre below the chin
  hideClone(t);
  const faceH = dist(px(forehead.x), py(forehead.y), px(chin.x), py(chin.y)) || faceWidth;
  const cx = px(chin.x), cy = py(chin.y) + faceH * 0.35;
  applyTransform(t, cx, cy, faceWidth * 0.6, 0);
  return true;
}

function applyTransform(t: ThreeCtx, cx: number, cy: number, targetPx: number, rot: number) {
  const piece = t.piece!;
  const s = targetPx / t.baseSize;
  piece.scale.setScalar(s);
  piece.position.set(cx, cy, 0);
  piece.rotation.set(0, 0, rot);
}

// Render the same piece at two points (earrings). Uses one group; draws primary,
// then temporarily moves for the second point within the same frame is not
// possible with one mesh, so we clone lazily.
function placeTwo(t: ThreeCtx, x1: number, y1: number, x2: number, y2: number, size: number) {
  const piece = t.piece!;
  const s = size / t.baseSize;
  piece.scale.setScalar(s);
  piece.position.set(x1, y1, 0);
  piece.rotation.set(0, 0, 0);
  // second earring
  const scene = t.scene as THREE.Scene & { __clone?: THREE.Group };
  if (!scene.__clone) {
    scene.__clone = piece.clone();
    scene.add(scene.__clone);
  }
  scene.__clone.visible = true;
  scene.__clone.scale.setScalar(s);
  scene.__clone.position.set(x2, y2, 0);
  scene.__clone.rotation.set(0, 0, 0);
}
