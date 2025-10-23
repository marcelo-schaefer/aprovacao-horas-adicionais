export interface PendenciaAprovacao {
  NNumEmp: string;
  ANomArq: string;
  ASigEmp: string;
  ADesLis: string;
  ADesTip: string;
  DDatPag: string;
  NOriPag: string;
  AOriPag: string;
  DIniPer: string;
  DFimPer: string;
  ANomBan: string;
  AHorGer: string;
  DDatGer: string;
  NTotReg: string;
  NValTot: string;
  ANomUsu: string;
  ANomEmp: string;
  selecionado: boolean;
  ADatHorGer: string;
  NValTotFormatado: string;
}

export interface RetornoPendenciaAprovacao {
  outputData: {
    TPendenciasAprovacao: PendenciaAprovacao[];
  };
}
