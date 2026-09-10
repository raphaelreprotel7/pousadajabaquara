export default function NotFound() {
  return (
    <main className="sec">
      <div className="shell" style={{ textAlign: 'center' }}>
        <h1 className="h-section">Página não encontrada</h1>
        <p className="body-text" style={{ margin: '24px auto 30px' }}>
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <a href="/" className="btn btn--red">Voltar para a home</a>
      </div>
    </main>
  )
}