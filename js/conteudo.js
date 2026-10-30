export const TIPOS = [
  'CDB', 'LCI', 'LCA', 'CRI', 'CRA', 'Debênture', 'Debênture Incentivada',
  'Tesouro Selic', 'Tesouro Prefixado', 'Tesouro IPCA+',
];

const PRIVADOS = ['pre', 'pctCDI', 'cdiMais', 'ipcaMais'];
const TESOURO = { 'Tesouro Selic': ['selicMais'], 'Tesouro Prefixado': ['pre'], 'Tesouro IPCA+': ['ipcaMais'] };

export const indexadoresDoTipo = tipo => TESOURO[tipo] ?? PRIVADOS;

export const ROTULO_INDEXADOR = {
  pre: 'Pré-fixado (% a.a.)',
  pctCDI: '% do CDI',
  cdiMais: 'CDI + taxa',
  ipcaMais: 'IPCA + taxa',
  selicMais: 'Selic + taxa',
};

const FGC = 'Coberto pelo FGC até R$ 250 mil por CPF e por instituição (teto global de R$ 1 milhão a cada 4 anos).';
const SEM_FGC = 'Não tem FGC: se o emissor quebrar, você pode perder o dinheiro. O risco depende da empresa ou do projeto por trás do título.';

export const EDUCATIVO = {
  'CDB': {
    oQueE: 'Certificado de Depósito Bancário: você empresta dinheiro a um banco e recebe juros por isso.',
    garantia: FGC,
    liquidez: 'Varia: alguns têm resgate diário, outros só no vencimento. Confira antes de aplicar.',
    tributacao: 'Tem IR pela tabela regressiva (22,5% a 15%) e IOF se resgatar antes de 30 dias.',
    indicadoPara: 'Reserva de emergência (os de liquidez diária) e objetivos com prazo definido.',
  },
  'LCI': {
    oQueE: 'Letra de Crédito Imobiliário: empréstimo a um banco que usa o dinheiro para financiar o setor imobiliário.',
    garantia: FGC,
    liquidez: 'Costuma ter carência mínima de meses; geralmente só resgata no vencimento.',
    tributacao: 'Isenta de IR para pessoa física.',
    indicadoPara: 'Quem não vai precisar do dinheiro até o vencimento e quer evitar o IR.',
  },
  'LCA': {
    oQueE: 'Letra de Crédito do Agronegócio: igual à LCI, mas o banco financia o agronegócio.',
    garantia: FGC,
    liquidez: 'Costuma ter carência mínima de meses; geralmente só resgata no vencimento.',
    tributacao: 'Isenta de IR para pessoa física.',
    indicadoPara: 'Quem não vai precisar do dinheiro até o vencimento e quer evitar o IR.',
  },
  'CRI': {
    oQueE: 'Certificado de Recebíveis Imobiliários: você financia empreendimentos imobiliários e recebe dos pagamentos deles.',
    garantia: SEM_FGC,
    liquidez: 'Baixa: vender antes do vencimento depende de haver comprador, e o preço pode ser menor.',
    tributacao: 'Isento de IR para pessoa física.',
    indicadoPara: 'Quem aceita mais risco por taxa maior e consegue esperar o vencimento.',
  },
  'CRA': {
    oQueE: 'Certificado de Recebíveis do Agronegócio: igual ao CRI, mas lastreado em operações do agronegócio.',
    garantia: SEM_FGC,
    liquidez: 'Baixa: vender antes do vencimento depende de haver comprador, e o preço pode ser menor.',
    tributacao: 'Isento de IR para pessoa física.',
    indicadoPara: 'Quem aceita mais risco por taxa maior e consegue esperar o vencimento.',
  },
  'Debênture': {
    oQueE: 'Título de dívida emitido por uma empresa: você empresta direto para ela.',
    garantia: SEM_FGC,
    liquidez: 'Baixa: vender antes do vencimento depende de haver comprador, e o preço pode ser menor.',
    tributacao: 'Tem IR pela tabela regressiva (22,5% a 15%).',
    indicadoPara: 'Quem analisa a saúde da empresa emissora e busca taxa maior que a dos bancos.',
  },
  'Debênture Incentivada': {
    oQueE: 'Debênture de empresa que financia infraestrutura (energia, saneamento, transporte), com incentivo do governo.',
    garantia: SEM_FGC,
    liquidez: 'Baixa: vender antes do vencimento depende de haver comprador, e o preço pode ser menor.',
    tributacao: 'Isenta de IR para pessoa física.',
    indicadoPara: 'Prazo longo, quem aceita o risco da empresa e quer evitar o IR.',
  },
  'Tesouro Selic': {
    oQueE: 'Título público que rende a taxa Selic: você empresta ao governo federal.',
    garantia: 'Garantido pelo Tesouro Nacional, considerado o investimento mais seguro do país.',
    liquidez: 'Diária, com pouca oscilação de preço.',
    tributacao: 'Tem IR regressivo, IOF antes de 30 dias e custódia da B3 de 0,20% a.a. (isenta até R$ 10 mil).',
    indicadoPara: 'Reserva de emergência e dinheiro que pode ser necessário a qualquer momento.',
  },
  'Tesouro Prefixado': {
    oQueE: 'Título público com taxa fixa definida na compra: você sabe quanto recebe no vencimento.',
    garantia: 'Garantido pelo Tesouro Nacional.',
    liquidez: 'Diária, mas o preço oscila: vender antes do vencimento pode dar lucro ou prejuízo.',
    tributacao: 'Tem IR regressivo, IOF antes de 30 dias e custódia da B3 de 0,20% a.a.',
    indicadoPara: 'Quem acredita que os juros vão cair e consegue levar até o vencimento.',
  },
  'Tesouro IPCA+': {
    oQueE: 'Título público que paga a inflação (IPCA) mais uma taxa fixa: protege o poder de compra.',
    garantia: 'Garantido pelo Tesouro Nacional.',
    liquidez: 'Diária, mas o preço oscila bastante: vender antes do vencimento pode dar prejuízo.',
    tributacao: 'Tem IR regressivo, IOF antes de 30 dias e custódia da B3 de 0,20% a.a.',
    indicadoPara: 'Objetivos de longo prazo, como aposentadoria, protegidos da inflação.',
  },
};
