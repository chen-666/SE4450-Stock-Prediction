import { Component, OnInit } from '@angular/core';
import { FinanceService } from "../finance.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, Validators } from "@angular/forms";
import { environment } from 'src/environments/environment';
import {
  Indicator,
  Range,
  Stock,
  StockChart,
  BollingerBands,
  MovingAverage,
  MACD,
  Alligator,
  bollingerBands, macd, alligator, ma
} from "../stock";
import { StockInfo, User } from "../user";
import { UserService } from "../user.service";
import { MatDialog } from "@angular/material/dialog";
import { PredictionComponent } from "../prediction/prediction.component";
import * as _ from "lodash"
import { SeriesOption } from "echarts";

export const _1DAY = 86400

@Component({
  selector: 'app-search-result',
  template: `
    <nav style="display: flex; padding: 20px; justify-content: space-between; ">
      <h1 routerLink="/">{{environment.title}}</h1>
      <form>
        <mat-form-field class="search"
                        appearance="fill"
                        style="max-width: 600px; min-width: 450px;">
          <input type="text" matInput
                 [matAutocomplete]="auto"
                 [formControl]="inputFormControl"
                 [(ngModel)]="searchText"
                 (ngModelChange)="change()"
                 placeholder="Please input the name，symbol, or number">
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option *ngFor="let option of options"
                        [value]="option.symbol"
                        (click)="select(option.symbol)">
              <div style="display: flex; justify-content: space-between">
                <span>{{option.symbol}}</span>
                <span>{{option.name}}</span>
                <span>{{option.typeDisp}}</span>
                <span>{{option.exch}}</span>
              </div>
            </mat-option>
          </mat-autocomplete>
          <button mat-icon-button color="primary" matSuffix
                  (click)="$event.preventDefault(); search()"
          >
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
      </form>
      <div *ngIf="!user"
           style="display: flex; align-items: flex-start; flex-direction: row; float: right;">
        <button mat-raised-button color="primary"
                routerLink="/signin">
          Sign in
        </button>
      </div>

      <div *ngIf="user"
           style="display: flex; align-items: flex-start; flex-direction: row; float: right;">
        <button mat-raised-button color="primary"
                (click)="signout()">
          Sign out
        </button>
      </div>
    </nav>

    <main style="margin: 30px">
      <mat-drawer-container
        style="height: 1024px">
        <mat-drawer *ngIf="user" mode="side" opened
                    style="width: 360px">
          <h3>My Watchlist</h3>
          <table *ngIf="user" mat-table [dataSource]="user.watchlist"
                 style="width: 100%;">
            <ng-container matColumnDef="symbol">
              <th mat-header-cell *matHeaderCellDef> Symbol</th>
              <td mat-cell *matCellDef="let element">{{element.symbol}}</td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef> Price</th>
              <td mat-cell *matCellDef="let element">{{element.price}}</td>
            </ng-container>
            <ng-container matColumnDef="change">
              <th mat-header-cell *matHeaderCellDef> Change</th>
              <td mat-cell *matCellDef="let element">{{element.price - element.last_price | number}}</td>
            </ng-container>
            <ng-container matColumnDef="change_percent">
              <th mat-header-cell *matHeaderCellDef> Change%</th>
              <td mat-cell
                  *matCellDef="let element">{{(element.price - element.last_price) / element.last_price | number}}%
              </td>
            </ng-container>
            <ng-container matColumnDef="delete">
              <th mat-header-cell *matHeaderCellDef>
                Delete
              </th>
              <td mat-cell *matCellDef="let row">
                <button mat-raised-button color="warn"
                        (click)="delete(row)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-drawer>
        <mat-drawer-content *ngIf="chart">
          <div style="font-size: 24px;padding: 20px;background-color: #ffffff">
            <span>{{chart?.meta?.symbol}}</span>
            <mat-icon *ngIf="star" (click)="addWatch(chart?.meta?.symbol)">{{star}}</mat-icon>
            <span style="margin-left: 60px">{{chart?.meta?.regularMarketPrice}}</span>
          </div>
          <mat-divider></mat-divider>
          <div style="padding: 20px;background-color: #ffffff">
            <button mat-raised-button (click)="openPrediction('week')">Prediction Next Week</button>
            <button mat-raised-button (click)="openPrediction('month')">Prediction Next Month</button>
          </div>
          <mat-divider></mat-divider>
          <div class="col">
            <div ngbDropdown class="d-inline-block">
              <button mat-raised-button ngbDropdownToggle>
                Indicators
              </button>
              <div ngbDropdownMenu>
                <button ngbDropdownItem (click)="addIndicator('MACD')">MACD</button>
                <button ngbDropdownItem (click)="addIndicator('BollingerBands')">Bollinger Bands</button>
                <button ngbDropdownItem (click)="addIndicator('MovingAverage')">Moving Average</button>
                <button ngbDropdownItem (click)="addIndicator('Alligator')">Alligator</button>
                <!--                <button ngbDropdownItem>KDJ</button>-->
              </div>
            </div>
          </div>

          <app-result [labels]="_labels" [series]="_series"></app-result>

          <mat-button-toggle-group name="range" aria-label="Range"
                                   [(ngModel)]="range"
                                   (change)="rangeChange()">
            <mat-button-toggle value="1d">1D</mat-button-toggle>
            <mat-button-toggle value="5d">5D</mat-button-toggle>
            <mat-button-toggle value="1mo">1M</mat-button-toggle>
            <mat-button-toggle value="3mo">3M</mat-button-toggle>
            <mat-button-toggle value="6mo">6M</mat-button-toggle>
            <mat-button-toggle value="1y">1Y</mat-button-toggle>
            <mat-button-toggle value="5y">5Y</mat-button-toggle>
            <!--            <mat-button-toggle value="10y">Blue</mat-button-toggle>-->
            <!--            <mat-button-toggle value="ytd">Blue</mat-button-toggle>-->
            <mat-button-toggle value="max">Max</mat-button-toggle>
          </mat-button-toggle-group>
        </mat-drawer-content>
      </mat-drawer-container>

    </main>
  `,
  styles: []
})
export class SearchResultComponent implements OnInit {
  environment = environment
  searchText = ''
  inputFormControl = new FormControl('', [Validators.required]);
  options?: Stock[]
  displayedColumns = ["symbol", "price", "change", "change_percent", "delete"]
  chart?: StockChart
  user?: User
  star?: string
  range: Range = '1d'
  indicators: Indicator[] = []
  macd: MACD = {
    fastMA: 0,
    slowMA: 0,
    signal: 0,
  }
  bollingerBands: BollingerBands = {
    period: 0,
    field: 0,
    std: 0,
  }
  ma: MovingAverage = {
    period: 5,
    field: 0,
    std: 0,
    offset: 0
  }
  alligator: Alligator = {
    jawPeriod: 0,
    jawOffset: 0,
    teethPeriod: 0,
    teethOffset: 0,
    lipsPeriod: 0,
    lipsOffset: 0,
  }

  _labels?: string[]
  _series?: SeriesOption[]


  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private financeService: FinanceService,
    private userService: UserService,
  ) {
  }

  setChart(chart: StockChart) {
    this.chart = chart
    if (this.chart) {
      if (this.user?.watchlist.length === 0)
        this.star = "star_border"
      else
        this.star = this.user?.watchlist.some(x => this.chart?.meta?.symbol === x.symbol)
          ? "star" : "star_border"
    }
    this._labels = this.labels()
    this._series = this.series()
  }

  ngOnInit(): void {
    const uid_ = localStorage.getItem('uid')
    const uid = uid_ ? Number.parseInt(uid_) : undefined
    if (uid) {
      this.userService.get(uid)
        .subscribe(
          value => {
            this.user = value as User
            if (this.user?.watchlist[0]?.symbol) {
              this.financeService.getChart(this.user?.watchlist[0].symbol)
                .subscribe(value => this.setChart(value))
            }
          }
        )
    }
  }

  search() {
    if (this.options && this.options.length > 0)
      this.financeService.getChart(this.options[0].symbol, this.range)
        .subscribe(value => this.setChart(value))
  }

  change() {
    this.financeService.search(this.searchText)
      .subscribe(os => this.options = os)
  }

  select(symbol: string) {
    this.financeService.getChart(symbol, this.range)
      .subscribe(value => this.setChart(value))
  }

  signout() {
    localStorage.removeItem('u')
    location.reload()
  }

  addWatch(symbol: string | undefined) {
    if (symbol && this.user?.watchlist.every(x => x.symbol !== symbol)) {
      const s = {
        symbol,
        price: this.chart?.meta.regularMarketPrice,
        last_price: this.chart?.meta.chartPreviousClose,
      }
      this.userService.watch(this.user.id, s).subscribe(() => {
        location.reload()
      }, ({error}) => alert(JSON.stringify(error.detail || error)))
    }
  }

  delete(stockInfo: StockInfo) {
    console.log(this.user, stockInfo)
    if (this.user && stockInfo?.id)
      this.userService.unwatch(this.user.id, stockInfo.id)
        .subscribe(() => {
          location.reload()
        }, ({error}) => console.log(JSON.stringify(error)))
  }

  openPrediction(time: string) {
    if (this.chart && this.chart.timestamp) {
      this.financeService.getChart(
        this.chart?.meta.symbol,
        '6mo'
      )
      .subscribe(chart => {
        console.log(chart)
        const start = _.last(chart.timestamp)

        if (!start) return
        const close = chart.indicators.quote[0].close
        const values = _.slice(close, close?.length -90)
        this.financeService.prediction({
          symbol: chart.meta.symbol,
          start: start + _1DAY,
          values: values
        }).subscribe(
          (value: any) => {
            console.log('prediction', value)
            if (time === 'week') {
              value.x = _.slice(value.x, 0, 7)
              value.y = _.slice(value.y, 0, 7)
            }

            const dialogRef = this.dialog.open(PredictionComponent, {
              width: '900px',
              height: '900px',
              data: value,
            })
            dialogRef.afterClosed().subscribe(result => {
              console.log(JSON.stringify(result));
            });
          },
          ({error}) => console.log(JSON.stringify(error))
        )


      })
    }
  }

  rangeChange() {
    console.log(this.range)
    if (this.chart)
      this.financeService.getChart(this.chart?.meta.symbol, this.range)
        .subscribe(value => this.setChart(value))
  }

  addIndicator(ind: string) {
    if (!this.chart?.indicators.adjclose[0].adjclose) return
    switch (ind) {
      case 'MACD':
        this.indicators.push({
          type: ind,
          x: macd(this.close()!, this.macd)
        })
        break
      case 'BollingerBands':
        this.indicators.push({
          type: ind,
          x: bollingerBands(this.close()!, this.bollingerBands)
        })
        break
      case 'MovingAverage':
        this.indicators.push({
          type: ind,
          x: ma(this.close()!, this.ma)
        })
        break
      case 'Alligator':
        this.indicators.push({
          type: ind,
          x: alligator(this.close()!, this.alligator)
        })
        break
      default:
        console.log(`Unknown indicator ${ind}`)
    }
    this._series = this.series()
  }

  close() {
    return this.chart?.indicators.quote[0].close
  }

  labels() {
    return this.chart?.timestamp.map(value => (new Date(value * 1000)).toDateString())
  }

  series() {
    return _.map([
      this.close()!,
      ...this.indicators.map(x => x.x)
    ], x => ({
      data: x,
      type: 'line',
    } as SeriesOption))
  }

}
