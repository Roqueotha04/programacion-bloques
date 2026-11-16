export function MenuScreen() {
  return (
    <main className="menu" id="menu">
      <section className="hero" id="hero">
        <svg
          className="bigbot"
          viewBox="-50 -50 100 100"
          id="heroBot"
          data-look="r"
          aria-hidden="true"
        />
        <div className="htxt">
          <h1 id="heroTitle" aria-label="Programa con GENI" />
          <p>
            Arrastrá los bloques, armá el programa y llevá a GENI hasta la
            estrella.
          </p>
          <div className="herobtns">
            <button className="shopbtn" id="shopBtn" />
            <span className="total" id="total" />
            <button
              className="resetbtn"
              id="resetBtn"
              title="Para cuando juega un alumno nuevo"
            />
          </div>
        </div>
      </section>
      <div id="worlds" />
      <div id="parts" />
      <div className="sec" id="sec3">
        <span className="sico" style={{ background: "#DDF6FF" }} id="ico3" />
        <h2>Mapa propio</h2>
        <span className="sub">inventá un mapa y jugalo</span>
      </div>
      <div className="cards" id="cards3" />
    </main>
  );
}
