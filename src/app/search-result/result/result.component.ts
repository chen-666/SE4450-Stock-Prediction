import { Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { StockChart } from "../../stock";
import { EChartsOption, SeriesOption } from "echarts";
import * as _ from "lodash";
import { round } from "lodash";

@Component({
  selector: 'app-result',
  template: `
    <div *ngIf="chartOption" echarts [options]="chartOption"
         style="height: 75%"

    ></div>
  `,
  styles: []
})
export class ResultComponent implements OnInit, OnChanges {
  @Input() labels?: string[]
  @Input() series?: SeriesOption[]
  @Output() onChange?: Function
  chartOption?: EChartsOption


  constructor() {
  }

  ngOnInit(): void {
    this.s()
  }

  s(): void {
    if (this.series) {
      const flat = _.flatten(this.series.map(x => (x.data as number[])))
      console.log(flat)
      const min = _.min(flat)
      const max = _.max(flat)
      const m = (max! - min!) * 0.1
      console.log(min, max)

      this.chartOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          data: this.labels,
        },
        yAxis: {
          axisLabel: {
            formatter: function (value: number | string, index: number) {
              if (typeof value === 'number') {
                return round(value, 0.001).toString();
              }
              return value
            },
          },
          axisLine: {onZero: false},
          type: 'value',
          min: min! - m,
          max: max! + m,
        },
        series: this.series
      }
    }

    console.log(this.chartOption)
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.s()
  }

}
