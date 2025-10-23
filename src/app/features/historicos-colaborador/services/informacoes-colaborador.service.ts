import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Colaborador,
  RetornoColaborador,
  RetornoPapelColaborador,
} from './models/colaborador.model';
import { RetornoGravacao } from './models/retorno-gravacao';
import { Persistencia } from './models/persistencia';
import { CorpoBusca } from './models/corpo-busca';
import { TokenService } from '../../../core/services/token.service';
import { RetornoHoraAdicional } from './models/hora-adicional';

@Injectable({
  providedIn: 'root',
})
export class InformacoesColaboradorService {
  private readonly basePayload = {
    id: 'f2200c3b-c7df-4040-9613-34f697b75889',
    inputData: {
      encryption: '3',
      server: 'https://ocweb03s1p.seniorcloud.com.br:31061/',
      module: 'rubi',
      service: 'com.senior.g5.rh.fp.apontamentoRetroativo',
      port: '',
      user: '',
      password: '',
      rootObject: '',
    },
  };

  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  public obterPapelSolicitante(): Observable<RetornoPapelColaborador> {
    const aNomeUsuario = this.tokenService.username;
    return this.http
      .post<RetornoPapelColaborador>(environment.plugin.invoke, {
        ...this.basePayload,
        inputData: {
          ...this.basePayload.inputData,
          port: 'verificaPapelSolicitante',
          aNomeUsuario,
        },
      })
      .pipe(
        catchError((error) => {
          return of({
            outputData: {
              APapelAdmAgendaEquipe: 'N',
              ARetorno: error.message || error.toString(),
              message: error.message || error.toString(),
            },
          });
        })
      );
  }

  public obterHorasAdicionais(): Observable<RetornoHoraAdicional> {
    return this.http
      .post<RetornoHoraAdicional>(environment.plugin.invoke, {
        ...this.basePayload,
        inputData: {
          ...this.basePayload.inputData,
          port: 'buscaColaboradores',
        },
      })
      .pipe(
        catchError((error) => {
          return of({
            outputData: {
              ARetorno: error.message || error.toString(),
              message: error.message || error.toString(),
            },
          });
        })
      );
  }

  public gravarEnvio(body: Persistencia): Observable<RetornoGravacao> {
    return this.http
      .post<RetornoGravacao>(environment.plugin.invoke, {
        ...this.basePayload,
        inputData: {
          ...this.basePayload.inputData,
          ...body,
          port: 'persistirDatas',
        },
      })
      .pipe(
        catchError((error) => {
          return of({
            outputData: {
              ARetorno: error.message || error.toString(),
              message: error.message || error.toString(),
            },
          });
        })
      );
  }
}
