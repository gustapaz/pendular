import { html, observable } from "sinuous";
import { model } from "./model";
import { motionToggle } from "./client";
const version = observable(0);
let ready = false,
  paused = false,
  playing = true,
  sim: any,
  index = 0,
  last = 0,
  acc = 0,
  visible = true,
  extent = 5.1;
const canvas = document.querySelector<HTMLCanvasElement>("#pendulum")!,
  ctx = canvas.getContext("2d")!,
  time = document.querySelector<HTMLInputElement>("#time")!,
  out = document.querySelector<HTMLOutputElement>("#time-value")!,
  play = document.querySelector<HTMLButtonElement>("#play")!;
let w = 0,
  hg = 0;
const a = model(
  "pendular",
  () => {
    const focused = (document.activeElement as HTMLElement)?.getAttribute(
      "aria-label",
    );
    version(version() + 1);
    if (focused)
      queueMicrotask(() =>
        document
          .querySelector<HTMLElement>('[aria-label="' + focused + '"]')
          ?.focus(),
      );
  },
  (r) => {
    sim = r;
    extent = Math.max(
      0.5,
      ...r.primary.map((p: any) => Math.hypot(p.x2, p.y2)),
      ...r.companion.map((p: any) => Math.hypot(p.x2, p.y2)),
    );
    index = 0;
    acc = 0;
    time.max = String(r.primary.length - 1);
    draw();
  },
);
const d = a.d;
function draw() {
  if (!w || !ctx) return;
  ctx.clearRect(0, 0, w, hg);
  const cx = w * 0.5,
    cy = hg * 0.45,
    scale = Math.min(w * 0.44, hg * 0.4) / extent;
  ctx.strokeStyle = "#ffffff12";
  ctx.lineWidth = 1;
  [1, 2, 3, 4, 5].forEach((v) => {
    ctx.beginPath();
    ctx.arc(cx, cy, scale * v, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, hg);
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy);
  ctx.stroke();
  if (!sim) return;
  const len = sim.primary.length;
  index = Math.max(0, Math.min(len - 1, index));
  const point = (p: any) => ({ x: cx + p.x2 * scale, y: cy + p.y2 * scale });
  const trail = (samples: any[], color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    for (let i = 0; i <= index; i++) {
      const p = point(samples[i]);
      if (!i) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  };
  trail(sim.primary, "#f5eeeccc");
  trail(sim.companion, "#ed703bdd");
  [sim.companion, sim.primary].forEach((samples: any[], i: number) => {
    const p = samples[index],
      color = i ? "#f5eeec" : "#ed703b";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + p.x1 * scale, cy + p.y1 * scale);
    ctx.lineTo(cx + p.x2 * scale, cy + p.y2 * scale);
    ctx.stroke();
    [
      [p.x1, p.y1, 5],
      [p.x2, p.y2, 9],
    ].forEach(([x, y, r]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx + x * scale, cy + y * scale, r, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  ctx.fillStyle = "#f5eeec";
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  out.textContent = sim.primary[index].t.toFixed(2) + " s";
  time.value = String(index);
}
new ResizeObserver(() => {
  w = canvas.clientWidth;
  hg = canvas.clientHeight;
  const ratio = Math.min(1.5, devicePixelRatio);
  canvas.width = w * ratio;
  canvas.height = hg * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw();
}).observe(canvas);
new IntersectionObserver((es) => (visible = es[0].isIntersecting)).observe(
  canvas,
);
function loop(t: number) {
  const dt = Math.min(100, t - last);
  last = t;
  if (sim && playing && !paused && visible && !document.hidden) {
    acc += dt;
    const steps = Math.floor(acc / (1000 / 60));
    if (steps) {
      acc -= (steps * 1000) / 60;
      index += steps;
      if (index >= sim.primary.length) {
        index = sim.primary.length - 1;
        playing = false;
        syncPlay();
      }
      draw();
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
function syncPlay() {
  play.textContent = playing ? "Pausar reprodução" : "Reproduzir";
  play.setAttribute("aria-pressed", String(!playing));
}
play.addEventListener("click", () => {
  playing = !playing;
  if (index >= (sim?.primary.length ?? 1) - 1) index = 0;
  syncPlay();
});
document.querySelector("#restart")!.addEventListener("click", () => {
  index = 0;
  acc = 0;
  playing = true;
  syncPlay();
  draw();
});
time.addEventListener("input", () => {
  index = +time.value;
  playing = false;
  syncPlay();
  draw();
});
motionToggle((v) => {
  paused = v;
  if (v) {
    playing = false;
    syncPlay();
  }
  draw();
});
const ranges = [
  ["length_a", "Primeira haste", 0.5, 2.5, 0.1, "m"],
  ["length_b", "Segunda haste", 0.5, 2.5, 0.1, "m"],
  ["angle_a", "Primeiro ângulo", -150, 150, 1, "°"],
  ["angle_b", "Segundo ângulo", -150, 150, 1, "°"],
  ["seconds", "Duração", 2, 12, 1, "s"],
  ["delta", "Diferença inicial", 0, 1, 0.01, "°"],
];
const view = () => {
  version();
  return html`<div class="experiment">
    ${
      d.catalog
        ? html`<div class="presets">
              ${d.catalog.presets.map((p: any) => html`<button disabled=${d.busy} onclick=${() => a.preset(p)}>${p.name} ↗</button>`)}
            </div>
            <div class="ranges">
              ${ranges.map(
                ([key, name, min, max, step, unit]) =>
                  html`<label
                    ><span
                      >${name}<output
                        >${d.input[key as string]} ${unit}</output
                      ></span
                    ><input
                      aria-label=${name}
                      type="range"
                      min=${min}
                      max=${max}
                      step=${step}
                      value=${d.input[key as string]}
                      onchange=${(e: Event) => a.change(key as string, +(e.target as HTMLInputElement).value)}
                  /></label>`,
              )}
            </div>
            <button
              class="simulate"
              disabled=${d.busy}
              onclick=${() => {
                a.run().then(() => {
                  playing = !paused;
                  syncPlay();
                  document.querySelector(".observatory")?.scrollIntoView();
                });
              }}
            >
              ${d.busy ? "Integrando…" : "Soltar os pêndulos ↗"}
            </button>`
        : html`<button onclick=${a.init}>Tentar carregar parâmetros</button>`
    }
    <p class="status" role="status">${d.error || d.status}</p>
    ${
      d.result
        ? html`<div class="measurements">
            <div>
              <span>MAIOR SEPARAÇÃO</span
              ><strong
                >${d.result.maximum_separation.toFixed(3)}<small>
                  m</small
                ></strong
              >
            </div>
            <div>
              <span>ENERGIA INICIAL</span
              ><strong
                >${d.result.initial_energy.toFixed(2)}<small> J</small></strong
              >
            </div>
            <div>
              <span>MAIOR DERIVA DE ENERGIA</span
              ><strong
                >${d.result.max_energy_drift.toExponential(2)}<small>
                  J</small
                ></strong
              >
            </div>
          </div>`
        : ""
    }
    <section class="archive">
      <div>
        <span>CONSERVE AS CONDIÇÕES INICIAIS</span
        ><label
          >Nome do experimento<input
            aria-label="Nome do experimento"
            maxlength="48"
            value=${d.title}
            oninput=${(e: Event) => {
              d.title = (e.target as HTMLInputElement).value;
            }} /></label
        ><button disabled=${d.busy || !d.result} onclick=${a.save}>
          ${d.current && d.owns ? "Salvar alterações" : "Guardar experimento"} ↗</button
        ><small
          >Experimentos sintéticos por 7 dias. Edição nesta aba. O CSV
          representa a revisão salva.</small
        >
      </div>
      <div>
        ${d.current ? html`<button disabled=${d.busy} onclick=${() => a.open(d.current.id)}>Reler do banco</button><button disabled=${d.busy} onclick=${a.download}>Exportar CSV ↓</button>${d.owns ? html`<button disabled=${d.busy} onclick=${a.share}>${d.current.published ? "Encerrar link" : "Criar link"}</button>` : ""}<button onclick=${a.fresh}>Novo experimento</button>` : ""}${d.link ? html`<a href=${d.link} target="_blank" rel="noreferrer">Abrir experimento compartilhado ↗</a>` : ""}
        <details>
          <summary>Arquivo desta aba (${d.archive.length})</summary>
          ${d.archive.map((x: any) => html`<button onclick=${() => a.open(x.id)}>${x.title} ↗</button>`)}
        </details>
      </div>
    </section>
  </div>`;
};
const host = document.querySelector("#app-root")!;
host.replaceChildren();
host.append(html`${view}`);
a.init();
if (new URL(location.href).searchParams.has("record"))
  document.querySelector("#controls")?.scrollIntoView();
