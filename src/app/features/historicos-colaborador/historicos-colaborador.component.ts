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
    this.inicializaComponente();
  }

  async ngAfterViewInit(): Promise<void> {
    // await this.buscaPapeisSolicitante();
    // await this.buscaHorasAdicionais();
    const dataHotel = new Date();
    dataHotel.setHours(0, 0, 0);
    this.horasAdicionais = [
      {
        NEmpresa: '1',
        NTipoColaborador: '1',
        NMatricula: '12345',
        ANome: 'Colaborador Teste',
        NCodigoProjeto: 'P001',
        ANomeProjeto: 'Projeto Teste',
        NHoras: '10:00',
        horaParcial: dataHotel,
      },
    ];
    this.preencherTabelaPendencias();
    this.carregandoInformacoes.set(false);
  }

  preencherTabelaPendencias(): void {
    this.tabelaPendenciasComponent.preencherListaHorasAdicionais(
      this.horasAdicionais
    );
  }

  inicializaComponente(): void {
    // this.buscaColaboradoresComponent.limparFormulario();
  }

  async buscaPapeisSolicitante(): Promise<void> {
    try {
      const projetos = await firstValueFrom(
        this.informacoesColaboradorService.obterPapelSolicitante()
      );
      if (projetos.outputData.message) {
        this.notificarErro(
          'Erro ao identificar o papel solicitante, ' +
            projetos.outputData.message
        );
        this.papelAdm = 'N';
      } else {
        this.papelAdm = projetos.outputData.APapelAdmAgendaEquipe || 'N';
      }
    } catch (error) {
      console.error(error);
      this.notificarErro(
        'Erro ao buscar os papeis do solicitante, tente mais tarde ou contate o admnistrador. ' +
          error
      );
      this.papelAdm = 'N';
      this.carregandoInformacoes.set(false);
    }
  }

  async buscaHorasAdicionais(): Promise<void> {
    try {
      const projetos = await firstValueFrom(
        this.informacoesColaboradorService.obterHorasAdicionais()
      );
      if (projetos.outputData.message) {
        this.notificarErro(
          'Erro ao buscar horas adicionais, ' + projetos.outputData.message
        );
      } else {
        this.horasAdicionais = projetos.outputData.horasAdicionais || [];
      }
    } catch (error) {
      console.error(error);
      this.notificarErro(
        'Erro ao buscar horas adicionais, tente mais tarde ou contate o admnistrador. ' +
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

  async enviarSolicitacao(): Promise<void> {
    this.desabilitarFormulario(true);
    this.carregandoInformacoes.set(true);
    await this.gravarEnvio();
  }

  desabilitarFormulario(desabilitar: boolean): void {
    // this.tabelaPendenciasComponent.desabilitarFormulario(desabilitar);
  }

  async gravarEnvio(): Promise<void> {
    await lastValueFrom(
      this.informacoesColaboradorService.gravarEnvio(this.montaCorpoEnvio())
    ).then(
      (data) => {
        if (data.outputData.message || data.outputData.ARetorno != 'OK') {
          this.notificarErro(
            'Erro ao gravar a data retroativa, ' +
              (data.outputData?.message || data.outputData?.ARetorno)
          );
          this.carregandoInformacoes.set(false);
          this.desabilitarFormulario(false);
        } else {
          this.notificarSucesso('Gravado com sucesso!');
          this.inicializaComponente();
          this.carregandoInformacoes.set(false);
          this.desabilitarFormulario(false);
        }
      },
      () => {
        this.notificarErro(
          'Erro ao gravar a data retroativa, tente mais tarde ou contate o administrador'
        );
        this.carregandoInformacoes.set(false);
        this.desabilitarFormulario(false);
      }
    );
  }

  formatarData(data: Date): string {
    return format(data, 'dd/MM/yyyy');
  }

  montaCorpoEnvio(): Persistencia {
    return {} as Persistencia;
  }
}
