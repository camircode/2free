export default function NotFound() {
  return (
    <section className="web-route-page" data-route-page>
      <p className="web-route-page__eyebrow">Espacio financiero</p>
      <h1>Página no encontrada</h1>
      <p className="web-route-page__description">
        La dirección que buscas no pertenece a las rutas disponibles.
      </p>
      <a className="web-route-page__link" href="/">
        Volver al inicio
      </a>
    </section>
  );
}
