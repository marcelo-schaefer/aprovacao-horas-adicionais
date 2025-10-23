export interface Persistencia {
  aNomArq: string;
  ANomArq?: string;
  aStaPen: string;
  AMsgRet?: string;
}

export interface RetornoPersistencia {
  outputData: {
    TPersistenciaPagamentos: Persistencia[];
    message: string;
  };
}
