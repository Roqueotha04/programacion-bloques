export function EditorScreen() {
  return (
    <main className="edit hidden" id="editor">
      <div className="boardwrap" id="eWrap">
        <div className="board editing" id="eBoard" />
      </div>
      <div className="panel side">
        <h3>Herramientas</h3>
        <div className="tools" id="tools" />
        <div className="row">
          <b>Tamaño</b>
          <div className="seg" id="sizeSeg">
            <button data-s="5">5×5</button>
            <button data-s="6">6×6</button>
            <button data-s="7">7×7</button>
          </div>
        </div>
        <div className="row">
          <button className="bigbtn" id="edPlay" />
          <button className="bigbtn alt" id="edClear">
            Vaciar
          </button>
        </div>
        <div className="msg" id="edMsg" />
      </div>
    </main>
  );
}
