"use client";

import * as React from "react";
import {
  geoOrthographic,
  geoPath,
  geoGraticule10,
  geoDistance,
} from "d3-geo";
import { motion, useReducedMotion } from "motion/react";

type LngLat = [number, number];

// Major ports (lng, lat) as route endpoints.
const PORTS: Record<string, LngLat> = {
  shanghai: [121.47, 31.23],
  rotterdam: [4.14, 51.95],
  singapore: [103.85, 1.29],
  losAngeles: [-118.27, 33.74],
  jebelAli: [55.06, 25.01],
  hamburg: [9.99, 53.55],
  santos: [-46.33, -23.95],
  mumbai: [72.84, 18.95],
};

const OCEAN = "#0369a1";
const LEAF = "#059669";

const ROUTES: Array<{ from: LngLat; to: LngLat; c: [string, string] }> = [
  { from: PORTS.shanghai, to: PORTS.rotterdam, c: [OCEAN, LEAF] },
  { from: PORTS.singapore, to: PORTS.losAngeles, c: [LEAF, OCEAN] },
  { from: PORTS.jebelAli, to: PORTS.hamburg, c: [OCEAN, LEAF] },
  { from: PORTS.santos, to: PORTS.mumbai, c: [LEAF, OCEAN] },
];

const PINS: LngLat[] = Object.values(PORTS);

export function Globe() {
  const reduce = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [land, setLand] = React.useState<GeoJSON.FeatureCollection | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch("/countries-110m.geojson")
      .then((r) => r.json())
      .then((geo) => active && setLand(geo))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const projection = geoOrthographic().precision(0.4);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();
    const tilt = -16;
    let lambda = 40;
    let size = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = root.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection
        .translate([size / 2, size / 2])
        .scale(size * 0.46);
    };

    const draw = (t: number) => {
      if (size === 0) return;
      projection.rotate([lambda, tilt]);
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.46;

      // atmosphere glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.14);
      glow.addColorStop(0, "rgba(3,105,161,0.16)");
      glow.addColorStop(1, "rgba(3,105,161,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.14, 0, Math.PI * 2);
      ctx.fill();

      // ocean sphere with subtle shading
      const sphere = ctx.createRadialGradient(
        cx - r * 0.3,
        cy - r * 0.3,
        r * 0.2,
        cx,
        cy,
        r,
      );
      sphere.addColorStop(0, "#ffffff");
      sphere.addColorStop(1, "#dfe9f5");
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = sphere;
      ctx.fill();

      // graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(100,116,139,0.12)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // continents
      if (land) {
        ctx.beginPath();
        path(land);
        ctx.fillStyle = "rgba(100,116,139,0.42)";
        ctx.fill();
      }

      // route arcs (great circles on the sphere) with flowing dashes
      const center: LngLat = [-lambda, -tilt];
      for (let i = 0; i < ROUTES.length; i++) {
        const route = ROUTES[i];
        const arc: GeoJSON.LineString = {
          type: "LineString",
          coordinates: [route.from, route.to],
        };
        // gradient across projected endpoints
        const p0 = projection(route.from);
        const p1 = projection(route.to);
        let stroke: string | CanvasGradient = route.c[0];
        if (p0 && p1) {
          const g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
          g.addColorStop(0, route.c[0]);
          g.addColorStop(1, route.c[1]);
          stroke = g;
        }
        ctx.beginPath();
        path(arc);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        if (!reduce) {
          ctx.setLineDash([14, 16]);
          ctx.lineDashOffset = -((t * 0.06 + i * 60) % 30);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // pins (front-facing only) with pulse
      for (let i = 0; i < PINS.length; i++) {
        const port = PINS[i];
        if (geoDistance(port, center) > Math.PI / 2) continue;
        const p = projection(port);
        if (!p) continue;
        const [x, y] = p;
        if (!reduce) {
          const phase = ((t / 1400 + i * 0.4) % 1);
          const ringR = 4 + phase * 12;
          ctx.beginPath();
          ctx.arc(x, y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(3,105,161,${0.5 * (1 - phase)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = OCEAN;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      lambda += 0.12;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [land, reduce]);

  return (
    <motion.div
      ref={rootRef}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-square w-full"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </motion.div>
  );
}
