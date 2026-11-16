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
          Tocá para comprar con estrellas. Dos veces para confirmar.
        </p>
        <h3>Caras</h3>
        <div className="skins" id="faces" />
        <h3>Cuerpo</h3>
        <div className="swatches" id="bodies" />
        <h3>Detalle</h3>
        <div className="swatches" id="accents" />
      </div>
    </main>
  );
}
