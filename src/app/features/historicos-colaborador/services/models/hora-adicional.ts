export interface HoraAdicional {
  selecionado?: boolean;
  NEmpresa: string;
  NTipoColaborador: string;
  NMatricula: string;
  ANome: string;
  NCodigoProjeto: string;
  ANomeProjeto: string;
  NHoras: string;
  horaParcial: Date;
}

export interface RetornoHoraAdicional {
  outputData: {
    horasAdicionais?: HoraAdicional[];
    ARetorno?: string;
    message?: string;
  };
}
