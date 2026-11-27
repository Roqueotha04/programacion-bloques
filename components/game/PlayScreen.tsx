export function PlayScreen() {
  return (
    <main className="ide hidden" id="game">
      <nav className="panel cats" id="cats" aria-label="Categorías" />
      <aside className="panel pal" id="pal" aria-label="Bloques" />
      <section className="panel script" id="script" aria-label="Programa">
        <div className="sbar">
          <h3>Mi programa</h3>
          <span className="pill" id="count" title="Bloques usados / máximo" />
          <span className="pill hidden" id="goal" />
          <button className="clear" id="clearBtn" />
        </div>
        <div className="canvas" id="canvas" />
        <div className="trash" id="trash" title="Soltá acá para borrar" />
      </section>
      <section className="panel stage">
        <div className="ctrls">
          <button className="cbtn go" id="runBtn" title="Ejecutar">
            <span className="cc" id="icoRun" />
            Ir
          </button>
          <button className="cbtn" id="stepBtn" title="Paso a paso">
            <span className="cc" id="icoStep" />
            Paso
          </button>
          <button className="cbtn" id="pauseBtn" title="Pausa" disabled>
            <span className="cc" id="icoPause" />
            <span id="pauseTxt">Pausa</span>
          </button>
          <button className="cbtn" id="stopBtn" title="Volver al inicio">
            <span className="cc" id="icoStop" />
            Inicio
          </button>
          <button className="cbtn" id="hintBtn" title="Pista">
            <span className="cc" id="icoHint" />
            Pista
          </button>
          <label className="speed" title="Velocidad">
            <span aria-hidden="true">🐢</span>
            <input
              type="range"
              id="speed"
              min={250}
              max={1050}
              step={50}
              defaultValue={650}
              aria-label="Velocidad"
            />
            <span aria-hidden="true">🐇</span>
          </label>
        </div>
        <div className="boardwrap" id="boardwrap">
          <div className="board" id="gBoard" />
        </div>
        <div className="status" id="status" />
        <div className="msg" id="msg" />
      </section>
    </main>
  );
}
