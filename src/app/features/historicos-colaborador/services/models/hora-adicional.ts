export interface HoraAdicional {
  id?: number;
  selecionado?: boolean;
  empresa: string;
  tipoColaborador: string;
  matricula: string;
  nome: string;
  projeto: string;
  nomeProjeto: string;
  horas: string;
  horasFormatadas: string;
  horasParciaisString: string;
}

export interface RetornoHoraAdicional {
  outputData: {
    horasSolicitadas?: HoraAdicional[];
    message?: string;
  };
}
