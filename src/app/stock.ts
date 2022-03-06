import * as _ from "lodash";

export interface Stock {
  symbol: string,
  name: string,
  exch: string,
  type: string,
  exchDisp: string,
  typeDisp: string
}

export type Range = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y" | "10y" | "ytd"

export type Comparison = {
  symbol: string,
  chartPreviousClose: number,
  low: number[],
  high: number[],
  open: number[],
  close: number[],
}

export interface StockChart {
  meta: {
    validRanges: string[],
    range: string,
    currency: string,
    symbol: string,
    exchangeName: string,
    instrumentType: string,
    firstTradeDate: number,
    regularMarketTime: number,
    gmtoffset: number,
    timezone: string,
    exchangeTimezoneName: string,
    regularMarketPrice: number,
    chartPreviousClose: number,
    priceHint: number,
  },
  timestamp: number[],
  comparisons: Comparison[],
  indicators: {
    quote: {
      low: number[],
      high: number[],
      open: number[],
      close: number[],
      volume: number[],
    }[],
    adjclose: {
      adjclose: number[]
    }[]
  },
}

export interface PredictionIn {
  symbol: string
  start: number
  values: number[]
}

export type Indicator = {
  type: 'MACD' | 'BollingerBands' | 'MovingAverage' | 'Alligator',
  x: number[]
}

export type MACD = {
  fastMA: number,
  slowMA: number,
  signal: number,
}

export type BollingerBands = {
  period: number,
  field: number,
  std: number,
}

export type MovingAverage = {
  period: number,
  field: number,
  std: number,
  offset: number
}

export type Alligator = {
  jawPeriod: number,
  jawOffset: number,
  teethPeriod: number,
  teethOffset: number,
  lipsPeriod: number,
  lipsOffset: number,
}

// type KDJ = {}

export function average(x: (number | undefined | string)[]) {
  return _.sum(_.dropWhile(x, x => !x || x === "null")) / x.length
}

export function macd(x: number[], b: MACD): number[] {
  return []
}

export function bollingerBands(x: number[], b: BollingerBands): number[] {
  return []
}

export function ma(x: number[], b: MovingAverage): number[] {
  const y = _.cloneDeep(x)
  for (let i = 0; i < x.length; i++) {
    if (i > b.period) {
      y[i] = average(_.slice(x, i - b.period, i))
    }
  }
  return y
}

export function alligator(x: number[], b: Alligator): number[] {
  return []
}
