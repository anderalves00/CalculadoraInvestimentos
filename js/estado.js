export const aplicarUnico = (colunas, unico) =>
  colunas.map(c => ({
    ...c,
    ...(unico.meses.ativo ? { meses: unico.meses.texto } : {}),
    ...(unico.valor.ativo ? { valor: unico.valor.texto } : {}),
  }));
