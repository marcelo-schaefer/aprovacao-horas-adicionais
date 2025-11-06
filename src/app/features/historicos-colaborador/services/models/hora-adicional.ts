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
  horasParciais: Date;
}

export interface RetornoHoraAdicional {
  outputData: {
    horasSolicitadas?: HoraAdicional[];
    message?: string;
  };
}
