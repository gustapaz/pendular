import { test } from "node:test";
import assert from "node:assert/strict";
import { service, derivatives } from "../server/service.mjs";
test("equilibrium remains at rest", () => {
  const r = service.compute({
    ...service.meta.default_input,
    angle_a: 0,
    angle_b: 0,
    delta: 0,
  });
  for (const p of r.primary) {
    assert.equal(p.x1, 0);
    assert.equal(p.x2, 0);
  }
  assert.equal(r.maximum_separation, 0);
});
test("zero difference yields identical trajectories", () => {
  const r = service.compute({ ...service.meta.default_input, delta: 0 });
  assert.deepEqual(r.primary, r.companion);
});
test("rods maintain exact geometric lengths", () => {
  const p = service.meta.default_input,
    r = service.compute(p);
  for (const v of r.primary) {
    assert.ok(Math.abs(Math.hypot(v.x1, v.y1) - p.length_a) < 1e-10);
    assert.ok(
      Math.abs(Math.hypot(v.x2 - v.x1, v.y2 - v.y1) - p.length_b) < 1e-10,
    );
  }
});
test("RK4 energy drift small in all provided presets", () => {
  for (const p of service.meta.presets) {
    const r = service.compute(p.input);
    assert.ok(r.max_energy_drift < 0.02, r.max_energy_drift.toString());
    assert.equal(r.primary.length, p.input.seconds * 60 + 1);
  }
});
test("bounded extreme case finite and deterministic", () => {
  const p = {
      length_a: 0.5,
      length_b: 2.5,
      angle_a: 150,
      angle_b: -150,
      seconds: 12,
      delta: 1,
    },
    r = service.compute(p);
  assert.ok(r.primary.every((v) => Object.values(v).every(Number.isFinite)));
  assert.deepEqual(r, service.compute(p));
  assert.ok(derivatives([0, 0, 0, 0], 1, 1).every((x) => x === 0));
});
test("schema rejects fractions duration unknown and nonfinite values", () => {
  for (const p of [
    { ...service.meta.default_input, seconds: 2.5 },
    { ...service.meta.default_input, length_a: 0 },
    { ...service.meta.default_input, angle_a: NaN },
    { ...service.meta.default_input, extra: 1 },
  ])
    assert.throws(() => service.compute(p));
});
