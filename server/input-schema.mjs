export const inputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["length_a", "length_b", "angle_a", "angle_b", "seconds", "delta"],
  properties: {
    length_a: { type: "number", minimum: 0.5, maximum: 2.5 },
    length_b: { type: "number", minimum: 0.5, maximum: 2.5 },
    angle_a: { type: "number", minimum: -150, maximum: 150 },
    angle_b: { type: "number", minimum: -150, maximum: 150 },
    seconds: { type: "integer", minimum: 2, maximum: 12 },
    delta: { type: "number", minimum: 0, maximum: 1 },
  },
};
