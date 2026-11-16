export function TopBar() {
  return (
    <header className="top">
      <button className="tbtn" id="codeBtn" title="Poner un código" />
      <button className="tbtn hidden" id="backBtn" />
      <div className="logo" id="logo">
        <svg
          viewBox="-50 -50 100 100"
          id="logoBot"
          data-look="r"
          aria-hidden="true"
        />
        <span>Programa con GENI</span>
      </div>
      <div className="ttitle hidden" id="tTitle">
        <span className="badge" id="tNum" />
        <span id="tName" />
      </div>
      <span className="grow" />
      <div className="ttimer hidden" id="tTimer" title="Tiempo del desafío" />
      <div className="tstars hidden" id="tStars" />
      <button className="wallet" id="wallet" title="Tus estrellas · Taller del robot">
        <span id="walletIco" />
        <span id="walletN">0</span>
      </button>
    </header>
  );
}
