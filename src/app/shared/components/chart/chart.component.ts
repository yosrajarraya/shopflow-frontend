import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Chart, registerables, ChartDataset, ChartOptions, ChartType } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  template: `
    <div class="chart-wrapper" [style.height.px]="heightPx">
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [':host{display:block;width:100%}.chart-wrapper{width:100%}canvas{display:block;width:100%!important;height:100%!important}'],
  standalone: false
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  @Input() datasets: ChartDataset[] = [{ data: [] }];
  @Input() labels: string[] = [];
  @Input() options: ChartOptions = { responsive: true, maintainAspectRatio: false };
  @Input() type: ChartType = 'line';
  @Input() heightPx = 260;

  private chartInstance: Chart | null = null;

  ngAfterViewInit(): void { this.renderChart(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chartInstance) return;
    let needsUpdate = false;
    if (changes['labels'] && !changes['labels'].isFirstChange()) {
      this.chartInstance.data.labels = this.labels as any;
      needsUpdate = true;
    }
    if (changes['datasets'] && !changes['datasets'].isFirstChange()) {
      this.chartInstance.data.datasets = this.datasets as any;
      needsUpdate = true;
    }
    if (changes['options'] && !changes['options'].isFirstChange()) {
      this.chartInstance.options = this.options as any;
      needsUpdate = true;
    }
    if (changes['type'] && !changes['type'].isFirstChange()) {
      this.destroyChart(); this.renderChart(); return;
    }
    if (needsUpdate) this.chartInstance.update();
  }

  private renderChart(): void {
    const ctx = this.canvas?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.destroyChart();
    this.chartInstance = new Chart(ctx, {
      type: this.type as any,
      data: { labels: this.labels as any, datasets: this.datasets as any },
      options: this.options as any,
    });
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      try { this.chartInstance.destroy(); } catch { }
      this.chartInstance = null;
    }
  }

  ngOnDestroy(): void { this.destroyChart(); }
}
