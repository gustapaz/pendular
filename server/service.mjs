import * as yup from "yup";
import { fail } from "./errors.mjs";
const schema = yup
  .object({
    length_a: yup.number().min(0.5).max(2.5).required(),
    length_b: yup.number().min(0.5).max(2.5).required(),
    angle_a: yup.number().min(-150).max(150).required(),
    angle_b: yup.number().min(-150).max(150).required(),
    seconds: yup.number().integer().min(2).max(12).required(),
    delta: yup.number().min(0).max(1).required(),
  })
  .noUnknown(true);
export const meta = {
  slug: "pendular",
  title: "PENDULAR",
  engine: "whatwg-yup-rk4",
  headline: "O caos deixa um traço.",
  default_input: {
    length_a: 1.4,
    length_b: 1.2,
    angle_a: 105,
    angle_b: -15,
    seconds: 8,
    delta: 0.2,
  },
  presets: [
    {
      name: "Quase iguais",
      input: {
        length_a: 1.4,
        length_b: 1.2,
        angle_a: 105,
        angle_b: -15,
        seconds: 8,
        delta: 0.2,
      },
    },
    {
      name: "Suave",
      input: {
        length_a: 1.5,
        length_b: 1.5,
        angle_a: 12,
        angle_b: 8,
        seconds: 8,
        delta: 0.1,
      },
    },
    {
      name: "Tensão",
      input: {
        length_a: 0.8,
        length_b: 1.9,
        angle_a: 145,
        angle_b: -90,
        seconds: 12,
        delta: 0.5,
      },
    },
  ],
  note: "Modelo ideal com massas unitárias, hastes sem massa, sem atrito e gravidade 9,81 m/s². Integração numérica RK4, não medição experimental nem engenharia estrutural.",
};
export function validate(input) {
  try {
    return schema.validateSync(input, { strict: true, abortEarly: false });
  } catch {
    fail(
      "invalid_input",
      "Comprimentos 0,5–2,5 m; ângulos ±150°; duração 2–12 s; diferença 0–1°.",
    );
  }
}
const g = 9.81;
export function derivatives(s, a, b) {
  const [t1, t2, w1, w2] = s,
    d = t1 - t2,
    c = Math.cos(d),
    sn = Math.sin(d),
    r1 = -b * w2 * w2 * sn - 2 * g * Math.sin(t1),
    r2 = a * w1 * w1 * sn - g * Math.sin(t2),
    det = a * b * (2 - c * c);
  return [w1, w2, (r1 * b - b * c * r2) / det, (2 * a * r2 - a * c * r1) / det];
}
export function energy(s, a, b) {
  const [t1, t2, w1, w2] = s;
  return (
    a * a * w1 * w1 +
    0.5 * b * b * w2 * w2 +
    a * b * w1 * w2 * Math.cos(t1 - t2) -
    2 * g * a * Math.cos(t1) -
    g * b * Math.cos(t2)
  );
}
function integrate(p, delta) {
  let s = [
      (p.angle_a * Math.PI) / 180,
      ((p.angle_b + delta) * Math.PI) / 180,
      0,
      0,
    ],
    dt = 1 / 240;
  const initial = energy(s, p.length_a, p.length_b),
    samples = [];
  let maxDrift = 0;
  for (let i = 0; i <= p.seconds * 240; i++) {
    if (i % 4 === 0) {
      const [a, b] = s,
        x1 = p.length_a * Math.sin(a),
        y1 = p.length_a * Math.cos(a);
      samples.push({
        t: i * dt,
        x1,
        y1,
        x2: x1 + p.length_b * Math.sin(b),
        y2: y1 + p.length_b * Math.cos(b),
      });
      maxDrift = Math.max(
        maxDrift,
        Math.abs(energy(s, p.length_a, p.length_b) - initial),
      );
    }
    if (i === p.seconds * 240) break;
    const k1 = derivatives(s, p.length_a, p.length_b),
      plus = (k, f) => s.map((v, j) => v + k[j] * dt * f),
      k2 = derivatives(plus(k1, 0.5), p.length_a, p.length_b),
      k3 = derivatives(plus(k2, 0.5), p.length_a, p.length_b),
      k4 = derivatives(plus(k3, 1), p.length_a, p.length_b);
    s = s.map((v, j) => v + (dt * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) / 6);
  }
  return { samples, initial_energy: initial, max_energy_drift: maxDrift };
}
export function compute(raw) {
  const p = validate(raw),
    a = integrate(p, 0),
    b = integrate(p, p.delta);
  return {
    model: "ideal-double-pendulum-rk4",
    step_seconds: 1 / 240,
    sample_hz: 60,
    primary: a.samples,
    companion: b.samples,
    initial_energy: a.initial_energy,
    max_energy_drift: a.max_energy_drift,
    maximum_separation: Math.max(
      ...a.samples.map((v, i) =>
        Math.hypot(v.x2 - b.samples[i].x2, v.y2 - b.samples[i].y2),
      ),
    ),
    units: { length: "m", time: "s", energy: "J" },
  };
}
export function exportResult(input) {
  const r = compute(input);
  return {
    type: "text/csv; charset=utf-8",
    extension: "csv",
    text:
      "t_s,x1_m,y1_m,x2_m,y2_m,companion_x2_m,companion_y2_m\n" +
      r.primary
        .map((p, i) =>
          [p.t, p.x1, p.y1, p.x2, p.y2, r.companion[i].x2, r.companion[i].y2]
            .map((x) => x.toFixed(7))
            .join(","),
        )
        .join("\n") +
      "\n",
  };
}
export const service = { meta, validate, compute, export: exportResult };
