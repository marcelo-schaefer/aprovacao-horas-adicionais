import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService, SortEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ToastModule } from 'primeng/toast';
import { PendenciaAprovacao } from '../../services/models/pendencia-aprovacao';
import { HoraAdicional } from '../../services/models/hora-adicional';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-tabela-pendencias',
  templateUrl: './tabela-pendencias.component.html',
  styleUrls: ['./tabela-pendencias.component.css'],
  standalone: true,
  imports: [
    LoadingComponent,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TabMenuModule,
    TableModule,
    ButtonModule,
    ToastModule,
    CalendarModule,
  ],
})
export class TabelaPendenciasComponent implements AfterViewInit {
  @Output()
  emitterEnviarPendencias: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  emitterGerarRelatorio: EventEmitter<boolean> = new EventEmitter<boolean>();

  carregandoInformacoes = signal(true);
  selectedItems: any[] = [];
  horasAdicionais: HoraAdicional[] = [];
  selecionarTodos: boolean = false;
  expandirTodos: boolean = false;
  desabilitar: boolean = false;

  constructor(
    private cdref: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    this.cdref.detectChanges();
  }

  preencherListaHorasAdicionais(horas: HoraAdicional[]): void {
    this.horasAdicionais = horas;
    this.preencheId();
    this.formataHoras();
    this.zeraHorasParciais();
  }

  preencheId(): void {
    this.horasAdicionais.forEach((hora, index) => {
      hora.id = index + 1;
    });
  }

  formataHoras(): void {
    this.horasAdicionais.forEach((hora) => {
      const horaNumber = Number(hora.horas);
      const horas = Math.floor(horaNumber / 60);
      const minutos = horaNumber % 60;
      hora.horasFormatadas =
        horas.toString().padStart(2, '0') +
        ':' +
        minutos.toString().padStart(2, '0');
    });
  }

  zeraHorasParciais(): void {
    this.horasAdicionais.forEach((hora) => {
      hora.horasParciais = new Date(0, 0, 0, 0, 0, 0);
    });
  }

  limparFormulario(): void {
    this.horasAdicionais = [];
  }

  desabilitarFormulario(desabilitar: boolean): void {
    this.desabilitar = desabilitar;
  }

  formataHoraParcial(horaParcial: Date): string {
    const horas = horaParcial.getHours().toString().padStart(2, '0');
    const minutos = horaParcial.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  limparLista(): void {
    if (this.horasAdicionais.length > 0)
      this.horasAdicionais.forEach((p) => (p.selecionado = false));
    this.cdref.detectChanges();
    this.horasAdicionais = [];
    this.cdref.detectChanges();
  }

  preencherListaPendenciasAprovacao(pendencias: PendenciaAprovacao[]): void {
    this.limparLista();
    this.horasAdicionais = JSON.parse(JSON.stringify(pendencias));
    if (this.horasAdicionais.length > 0)
      this.horasAdicionais.forEach((p) => (p.selecionado = false));
    this.loadingTabela(false);
  }

  retornaPendenciasSelecionadas(): HoraAdicional[] {
    return this.horasAdicionais.filter((pendencia) => pendencia.selecionado);
  }

  selecionarTodosRegistros(): void {
    this.selecionarTodos = !this.selecionarTodos;
    if (this.horasAdicionais) {
      this.horasAdicionais.forEach((item) => {
        item.selecionado = this.selecionarTodos;
      });
    }
  }

  resetarSelecoes(): void {
    this.selectedItems = [];
    if (this.horasAdicionais) {
      this.horasAdicionais.forEach((item) => {
        item.selecionado = false;
      });
    }
  }

  loadingTabela(carregando: boolean): void {
    this.carregandoInformacoes.set(carregando);
  }

  emitirEnviarPendencias(aprovar: boolean): void {
    if (this.retornaPendenciasSelecionadas().length > 0) {
      this.loadingTabela(true);
      this.emitterEnviarPendencias.emit(aprovar);
    } else
      this.notificarErro(
        'Selecione ao menos uma pendência para aprovar ou reprovar.'
      );
  }

  emitirGerarRelatorio(): void {
    this.resetarSelecoes();
    this.cdref.detectChanges();
  }

  customSort(event: SortEvent) {
    const field = event.field;
    const order = event.order ?? 1;

    if (event.data) {
      event.data.sort((data1, data2) => {
        let value1: any;
        let value2: any;
        if (typeof field === 'string') {
          value1 = data1[field];
          value2 = data2[field];
        } else {
          value1 = undefined;
          value2 = undefined;
        }

        // Caso especial: campo de data em string brasileira
        if (field === 'DDatPag' || field === 'DDatGer') {
          const parseData = (str: string): Date => {
            // Aceita formato "dd/MM/yyyy"
            const [day, month, year] = str.split('/').map(Number);
            return new Date(year, month - 1, day, 0, 0);
          };

          value1 = parseData(value1);
          value2 = parseData(value2);

          return (value1.getTime() - value2.getTime()) * order;
        }

        // Caso especial: campo de date e hora em string brasileira
        if (field === 'NValTotFormatado') {
          const parseHora = (str: string): Date => {
            // Aceita formato "dd/MM/yyyy HH:mm"
            const [date, time] = str.split(' ');
            const [day, month, year] = date.split('/').map(Number);
            const [hour, minute] = time.split(':').map(Number);
            return new Date(year, month - 1, day, hour, minute);
          };

          value1 = parseHora(value1);
          value2 = parseHora(value2);

          return (value1.getTime() - value2.getTime()) * order;
        }

        // Para valores numéricos
        if (typeof value1 === 'number' && typeof value2 === 'number') {
          return (value1 - value2) * order;
        }

        // Para strings
        if (typeof value1 === 'string' && typeof value2 === 'string') {
          return value1.localeCompare(value2) * order;
        }

        // Fallback
        return 0;
      });
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
}
