import ClientBoot from "./client-boot";
export default function Home() {
  return (
    <>
      <a className="skip" href="#controls">
        Ir para os parâmetros
      </a>
      <header>
        <a className="brand" href="/">
          PENDULAR<span>ESTUDOS DO IMPREVISÍVEL</span>
        </a>
        <nav>
          <a href="#controls">Alterar condições ↗</a>
          <a href="#theory">O experimento ↓</a>
        </nav>
      </header>
      <main>
        <section className="observatory">
          <div className="stage-top">
            <span>SISTEMA Nº 02 / PÊNDULO DUPLO</span>
            <span>DOIS COMEÇOS. DOIS CAMINHOS.</span>
          </div>
          <h1>
            Quase igual.
            <br />
            <em>Completamente outro.</em>
          </h1>
          <canvas
            id="pendulum"
            role="img"
            aria-label="Trajetórias de dois pêndulos duplos calculadas no servidor; métricas e condições estão nos parâmetros abaixo"
          />
          <div className="stage-edge">
            <span>01 — CONDIÇÃO ORIGINAL</span>
            <span>02 — UMA DIFERENÇA MÍNIMA</span>
          </div>
          <div className="time-controls">
            <button id="play" aria-pressed="false">
              Pausar reprodução
            </button>
            <label>
              Instante <output id="time-value">0.00 s</output>
              <input
                id="time"
                aria-label="Instante da simulação"
                type="range"
                min="0"
                max="480"
                value="0"
              />
            </label>
            <button id="restart">Recomeçar ↺</button>
          </div>
          <span className="stage-note">
            MODELO IDEAL · SEM ATRITO · MASSAS DE 1 kg
          </span>
        </section>
        <section id="controls">
          <div className="control-title">
            <span>A ORIGEM DO DESVIO</span>
            <h2>
              Mude o início.
              <br />
              Assista ao <em>depois.</em>
            </h2>
          </div>
          <div id="app-root">
            <p>Preparando a simulação…</p>
          </div>
        </section>
        <section id="theory" className="theory">
          <div className="clockwork">
            <img
              src="/media/clockwork.webp"
              alt="Mecanismo real de relógio, com engrenagens e peças metálicas"
              width="1400"
              height="933"
              loading="lazy"
            />
          </div>
          <div>
            <span>DETERMINÍSTICO. MAS NEM SEMPRE INTUITIVO.</span>
            <h2>
              O caos não
              <br />é ausência
              <br />
              <em>de regras.</em>
            </h2>
            <p>
              As mesmas equações governam os dois sistemas. Uma pequena
              diferença no ângulo inicial pode produzir trajetórias que se
              afastam com o tempo.
            </p>
            <p>
              Nem toda condição é caótica no intervalo observado. Experimente
              também o movimento suave. O traço vem de integração numérica, não
              de uma medição.
            </p>
            <div className="constants">
              <span>
                g <b>9,81 m/s²</b>
              </span>
              <span>
                Δt <b>1/240 s</b>
              </span>
              <span>
                amostras <b>60 Hz</b>
              </span>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <strong>PENDULAR</strong>
        <p>Uma experiência de Gustavo Paz.</p>
        <a href="/api-docs.html">Equações e API ↗</a>
        <a href="https://github.com/gustapaz/pendular">Código e créditos ↗</a>
        <small>Fotografia: Tima Miroshnichenko / Pexels.</small>
        <button id="motion-toggle" aria-pressed="false">
          Pausar movimento
        </button>
      </footer>
      <ClientBoot />
    </>
  );
}
