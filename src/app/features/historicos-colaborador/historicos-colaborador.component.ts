import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { InformacoesColaboradorService } from './services/informacoes-colaborador.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Persistencia } from './services/models/persistencia';
import { format } from 'date-fns';
import { TabelaPendenciasComponent } from './components/tabela-pendencias/tabela-pendencias.component';
import { HoraAdicional } from './services/models/hora-adicional';

@Component({
  selector: 'app-historicos-colaborador',
  standalone: true,
  imports: [
    FormsModule,
    TabelaPendenciasComponent,
    LoadingComponent,
    CalendarModule,
    ToastModule,
    ProgressSpinnerModule,
    RippleModule,
  ],
  providers: [MessageService],
  templateUrl: './historicos-colaborador.component.html',
  styleUrl: './historicos-colaborador.component.css',
})
export class HistoricosColaboradorComponent implements OnInit, AfterViewInit {
  @ViewChild(TabelaPendenciasComponent, { static: true })
  tabelaPendenciasComponent: TabelaPendenciasComponent | undefined;

  private informacoesColaboradorService = inject(InformacoesColaboradorService);

  carregandoInformacoes = signal(false);
  papelAdm: string;
  horasAdicionais: HoraAdicional[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.carregandoInformacoes.set(true);
  }

  ngAfterViewInit(): void {
    this.inicializaComponente();
  }

  preencherTabelaPendencias(): void {
    this.tabelaPendenciasComponent.preencherListaHorasAdicionais(
      this.horasAdicionais
    );
  }

  limparFormulario(): void {
    this.horasAdicionais = [];
    this.tabelaPendenciasComponent.limparFormulario();
  }

  async inicializaComponente(): Promise<void> {
    this.limparFormulario();
    await this.buscaHorasAdicionais();
    this.preencherTabelaPendencias();
    this.carregandoInformacoes.set(false);
    this.desabilitarFormulario(false);
  }

  async buscaHorasAdicionais(): Promise<void> {
    try {
      const projetos = await firstValueFrom(
        this.informacoesColaboradorService.obterHorasSolicitadas()
      );
      if (projetos.outputData.message) {
        this.notificarErro(
          'Erro ao buscar horas solicitadas, ' + projetos.outputData.message
        );
      } else {
        if (
          projetos.outputData.horasSolicitadas &&
          !Array.isArray(projetos.outputData.horasSolicitadas)
        )
          projetos.outputData.horasSolicitadas = [
            projetos.outputData.horasSolicitadas,
          ];
        this.horasAdicionais = projetos.outputData.horasSolicitadas || [];
      }
    } catch (error) {
      console.error(error);
      this.notificarErro(
        'Erro ao buscar horas solicitadas, tente mais tarde ou contate o admnistrador. ' +
          error
      );
      this.papelAdm = 'N';
      this.carregandoInformacoes.set(false);
    }
  }

  notificarErro(mensagem: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: mensagem,
      life: 10000,
    });
  }
  notificarSucesso(mensagem: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: mensagem,
      life: 10000,
    });
  }

  async enviarSolicitacao(aprovar: boolean): Promise<void> {
    this.desabilitarFormulario(true);
    this.carregandoInformacoes.set(true);
    await this.gravarEnvio(aprovar);
  }

  desabilitarFormulario(desabilitar: boolean): void {
    this.tabelaPendenciasComponent.desabilitarFormulario(desabilitar);
  }

  async gravarEnvio(aprovar: boolean): Promise<void> {
    await lastValueFrom(
      this.informacoesColaboradorService.gravarEnvio(
        this.montaCorpoEnvio(aprovar)
      )
    ).then(
      (data) => {
        if (data.outputData.message || data.outputData.retorno != 'OK') {
          this.notificarErro(
            'Erro ao gravar a aprovação/reprovação das horas selecionadas, ' +
              (data.outputData?.message || data.outputData?.retorno)
          );
          this.carregandoInformacoes.set(false);
          this.desabilitarFormulario(false);
        } else {
          this.notificarSucesso('Gravado com sucesso!');
          this.inicializaComponente();
        }
      },
      () => {
        this.notificarErro(
          'Erro ao gravar a aprovação/reprovação das horas selecionadas, tente mais tarde ou contate o administrador'
        );
        this.carregandoInformacoes.set(false);
        this.desabilitarFormulario(false);
      }
    );
  }

  formatarData(data: Date): string {
    return format(data, 'dd/MM/yyyy');
  }

  montaCorpoEnvio(aprovar: boolean): Persistencia[] {
    return this.tabelaPendenciasComponent
      .retornaPendenciasSelecionadas()
      .map((pendencia) => {
        return {
          empresa: Number(pendencia.empresa),
          tipoColaborador: Number(pendencia.tipoColaborador),
          matricula: Number(pendencia.matricula),
          projeto: Number(pendencia.projeto),
          horas: Number(pendencia.horas),
          horasParciais: this.horasParaMinutos(pendencia.horasParciaisString),
          aprovar: aprovar ? 'S' : 'N',
        };
      });
  }

  horasParaMinutos(h: string): number {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  }
}
