const IOF = [96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3];

const ISENTOS = new Set(['LCI', 'LCA', 'CRI', 'CRA', 'Debênture Incentivada']);

export function aliquotaIR(diasCorridos) {
  if (diasCorridos <= 180) return .225;
  if (diasCorridos <= 360) return .20;
  if (diasCorridos <= 720) return .175;
  return .15;
}

export function aliquotaIOF(diasCorridos) {
  if (diasCorridos < 1 || diasCorridos >= 30) return 0;
  return IOF[diasCorridos - 1] / 100;
}

export const ehIsento = tipo => ISENTOS.has(tipo);
