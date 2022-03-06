import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { EChartsOption } from "echarts";
import * as _ from "lodash";
import { round } from "lodash";

export interface DialogData {
  symbol: string
  x: number[]
  y: number[]
}


@Component({
  selector: 'app-prediction',
  template: `
    <h1 mat-dialog-title>prediction</h1>
    <div mat-dialog-content
         style="height: 100%">
      <div *ngIf="chartOption" echarts [options]="chartOption"
           style="height: 100%"></div>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data">Ok</button>
    </div>
  `,
  styles: []
})
export class PredictionComponent implements OnInit {
  chartOption?: EChartsOption

  constructor(
    private dialogRef: MatDialogRef<PredictionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    const min = _.min(data.y)
    const max = _.max(data.y)
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
        data: data.x.map(value => (new Date(value * 1000)).toDateString()),
      },
      yAxis: {
        type: 'value',
        min: min! - m,
        max: max! + m,
        axisLabel: {
          formatter: function (value: number | string, index: number) {
            if (typeof value === 'number') {
              return round(value, 0.001).toString();
            }
            return value
          },
        },
        axisLine: {onZero: false},
      },
      series: [
        {
          data: data.y,
          type: 'line',
        },
      ],
    }
  }

  ngOnInit(): void {
  }

}
