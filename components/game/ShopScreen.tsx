export function ShopScreen() {
  return (
    <main className="shop hidden" id="shop">
      <div className="panel stagebox">
        <div className="pedestal" id="ped" />
        <h2 id="shopName" />
        <p id="shopStars" />
      </div>
      <div className="panel shopside">
        <h3>Diseños</h3>
        <div className="skins" id="skins" />
        <p className="tip">
          Tocá un diseño para comprarlo con estrellas (tocá dos veces para
          confirmar).
        </p>
        <h3>Colores</h3>
        <div className="swatches" id="swatches" />
      </div>
    </main>
  );
}
