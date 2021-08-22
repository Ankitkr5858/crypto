<template>
  <v-container>
    <v-row>
      <v-col class="text-center d-flex">
        <v-card color="red lighten-2 flex-grow-1" dark>
          <v-card-title class="text-h5 red lighten-3">
            Search for a cryptocurrency by Its Symbol
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="cryptoSearchKeyword"
              :items="cryptocurrencies"
              :loading="isLoading"
              color="white"
              item-text="symbol"
              item-value="symbol"
              placeholder="Start typing to Search"
              prepend-icon="mdi-database-search"
              return-object
            >
              <template v-slot:selection="{ attr, on, item, selected }">
                <v-chip
                  v-bind="attr"
                  :input-value="selected"
                  color="blue-grey"
                  class="white--text"
                  v-on="on"
                >
                  <v-icon left> mdi-bitcoin </v-icon>
                  <span v-text="item.name"></span>
                </v-chip>
              </template>
              <template v-slot:item="{ item }">
                <v-list-item-avatar
                  color="indigo"
                  class="text-h5 font-weight-light white--text"
                >
                  {{ item.name.charAt(0) }}
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                  <v-list-item-subtitle
                    v-text="item.symbol"
                  ></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-bitcoin</v-icon>
                </v-list-item-action>
              </template>
            </v-autocomplete>
          </v-card-text>
          <v-divider></v-divider>
        </v-card>
        <div class="d-flex ml-auto p-2" v-if="ratingData['1. symbol']">
          <v-card>
            <v-card-title :style="getColor">
              {{ ratingData['1. symbol'] }} -
              {{ ratingData['2. name'] }}</v-card-title
            >
            <v-card-text class="mt-3">
              {{ ratingData['3. fcas rating'] }} -
              {{ ratingData['4. fcas score'] }}
            </v-card-text>
            <v-card-text>
              Developer Score {{ ratingData['5. developer score'] }}
            </v-card-text>
            <v-card-text>
              Market Maturity Score {{ ratingData['6. market maturity score'] }}
            </v-card-text>
            <v-card-text>
              Utility Score {{ ratingData['7. utility score'] }}
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div>
          <v-btn-toggle
            v-model="duration"
            tile
            color="deep-purple accent-3"
            group
          >
            <v-btn value="daily" @click="fetchData()"> Day </v-btn>

            <v-btn value="weekly" @click="fetchData()"> Weekly </v-btn>

            <v-btn value="monthly" @click="fetchData()"> Monthly </v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div class="hello" ref="chartdiv"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import cryptocurrencies from './cryptocurrencies.json'
export default {
  data: () => ({
    duration: 'monthly',
    descriptionLimit: 60,
    entries: [],
    isLoading: false,
    cryptoSearchKeyword: null,
    search: null,
    cryptoAPIKey: {
      symbol: '1. symbol',
      name: '2. name',
    },
    zoomTimeout: '',
    cryptocurrencies: cryptocurrencies,
    dateAxis: null,
    chart: null,
    ratingData: {},
  }),

  computed: {
    fields() {
      if (!this.cryptoSearchKeyword) return []

      return Object.keys(this.cryptoSearchKeyword).map((key) => {
        return {
          key,
          value: this.cryptoSearchKeyword[key] || 'n/a',
        }
      })
    },
    getColor() {
      switch (this.ratingData['3. fcas rating']) {
        case 'Superb':
          return 'background-color:#00e685'
          break

        case 'Attractive':
          return 'background-color:#73efbb'
          break

        case 'Basic':
          return 'background-color:#bfefdb'
          break

        case 'Caution':
          return 'background-color:#ffac70'
          break

        case 'Fragile':
          return 'background-color:#ff4d4d'
          break

        default:
          return ''
          break
      }
    },
  },
  methods: {
    remove(item) {
      const index = this.cryptoSearchKeyword.findIndex(
        (singleItem) => singleItem.name == item.name
      )
      if (index >= 0) this.cryptoSearchKeyword.splice(index, 1)
    },
    initChart(chartData) {
      if (this.chart) {
        this.chart.dispose()
      }
      this.$nextTick(() => {
        this.chart = this.$am4core.create(
          this.$refs.chartdiv,
          this.$am4charts.XYChart
        )
        this.chart.padding(0, 15, 0, 15)

        // Load external data
        this.chart.dataSource.url =
          'https://www.amcharts.com/wp-content/uploads/assets/stock/MSFT.csv'
        this.chart.dataSource.parser = new this.$am4core.CSVParser()
        this.chart.dataSource.parser.options.useColumnNames = true
        this.chart.dataSource.parser.options.reverse = true

        // the following line makes value axes to be arranged vertically.
        this.chart.leftAxesContainer.layout = 'vertical'

        // uncomment this line if you want to change order of axes
        //this.chart.bottomAxesContainer.reverseOrder = true;

        this.dateAxis = this.chart.xAxes.push(new this.$am4charts.DateAxis())
        this.dateAxis.renderer.grid.template.location = 0
        this.dateAxis.renderer.ticks.template.length = 8
        this.dateAxis.renderer.ticks.template.strokeOpacity = 0.1
        this.dateAxis.renderer.grid.template.disabled = true
        this.dateAxis.renderer.ticks.template.disabled = false
        this.dateAxis.renderer.ticks.template.strokeOpacity = 0.2
        this.dateAxis.renderer.minLabelPosition = 0.01
        this.dateAxis.renderer.maxLabelPosition = 0.99
        this.dateAxis.keepSelection = true
        this.dateAxis.minHeight = 30

        this.dateAxis.groupData = true
        this.dateAxis.minZoomCount = 5

        // these two lines makes the axis to be initially zoomed-in
        // this.dateAxis.start = 0.7;
        // this.dateAxis.keepSelection = true;

        var valueAxis = this.chart.yAxes.push(new this.$am4charts.ValueAxis())
        valueAxis.tooltip.disabled = true
        valueAxis.zIndex = 1
        valueAxis.renderer.baseGrid.disabled = true
        // height of axis
        valueAxis.height = this.$am4core.percent(65)

        valueAxis.renderer.gridContainer.background.fill =
          this.$am4core.color('#000000')
        valueAxis.renderer.gridContainer.background.fillOpacity = 0.05
        valueAxis.renderer.inside = true
        valueAxis.renderer.labels.template.verticalCenter = 'bottom'
        valueAxis.renderer.labels.template.padding(2, 2, 2, 2)

        //valueAxis.renderer.maxLabelPosition = 0.95;
        valueAxis.renderer.fontSize = '0.8em'

        var series = this.chart.series.push(new this.$am4charts.LineSeries())
        series.dataFields.dateX = 'Date'
        series.dataFields.valueY = 'Adj Close'
        series.tooltipText = '{valueY.value}'
        series.name = 'MSFT: Value'
        series.defaultState.transitionDuration = 0

        var valueAxis2 = this.chart.yAxes.push(new this.$am4charts.ValueAxis())
        valueAxis2.tooltip.disabled = true
        // height of axis
        valueAxis2.height = this.$am4core.percent(35)
        valueAxis2.zIndex = 3
        // this makes gap between panels
        valueAxis2.marginTop = 30
        valueAxis2.renderer.baseGrid.disabled = true
        valueAxis2.renderer.inside = true
        valueAxis2.renderer.labels.template.verticalCenter = 'bottom'
        valueAxis2.renderer.labels.template.padding(2, 2, 2, 2)
        //valueAxis.renderer.maxLabelPosition = 0.95;
        valueAxis2.renderer.fontSize = '0.8em'

        valueAxis2.renderer.gridContainer.background.fill =
          this.$am4core.color('#000000')
        valueAxis2.renderer.gridContainer.background.fillOpacity = 0.05

        var series2 = this.chart.series.push(new this.$am4charts.ColumnSeries())
        series2.dataFields.dateX = 'Date'
        series2.dataFields.valueY = 'Volume'
        series2.yAxis = valueAxis2
        series2.tooltipText = '{valueY.value}'
        series2.name = 'MSFT: Volume'
        // volume should be summed
        series2.groupFields.valueY = 'sum'
        series2.defaultState.transitionDuration = 0

        this.chart.cursor = new this.$am4charts.XYCursor()

        var scrollbarX = new this.$am4charts.XYChartScrollbar()
        scrollbarX.series.push(series)
        scrollbarX.marginBottom = 20
        scrollbarX.scrollbarChart.xAxes.getIndex(0).minHeight = undefined
        this.chart.scrollbarX = scrollbarX
      })
    },
    fetchData(symbol, duration) {
      var thiz = this
      symbol = symbol || this.cryptoSearchKeyword.symbol
      duration = duration || this.duration
      var str = 'Monthly'
      switch (duration) {
        case 'daily':
          str = 'Daily'
          break

        case 'weekly':
          str = 'Weekly'
          break

        default:
          break
      }
      var thiz = this
      console.log(this.duration)
      this.$alpha.crypto[this.duration](symbol, 'USD').then(function (data) {
        console.log(data)
        var chartData = []
        var tsv = data['Time Series (Digital Currency ' + str + ')']
        Object.keys(tsv).forEach((key) => {
          chartData.push({
            Close: tsv[key]['4b. close (USD)'],
            Date: new Date(key),
            High: tsv[key]['2b. high (USD)'],
            Low: tsv[key]['3b. low (USD)'],
            Open: tsv[key]['1b. open (USD)'],
            Volume: parseFloat(tsv[key]['5. volume']),
            'Adj Close': parseFloat(tsv[key]['4b. close (USD)']),
          })
        })
        console.log(chartData)
        thiz.initChart(chartData)
      })
      fetch(thiz.$alpha.util.url({ symbol }) + '&function=CRYPTO_RATING')
        .then((res) => {
          if (res.status !== 200) {
            throw `An AlphaVantage error occurred. ${res.status}: ${res.text()}`
          }

          return res.json()
        })
        .then(function (data) {
          console.log((data['Crypto Rating (FCAS)']))
          thiz.ratingData = data['Crypto Rating (FCAS)'] || {}
        })
    },
  },
  watch: {
    cryptoSearchKeyword(val) {
      console.log(val)
      if (val && val.symbol) {
        this.fetchData(val.symbol, this.duration)
      }
    },
    duration(val) {
      if (this.cryptoSearchKeyword && this.cryptoSearchKeyword.symbol) {
        this.fetchData(this.cryptoSearchKeyword.symbol, val)
      }
    },
  },
  mounted() {},

  beforeDestroy() {},
}
</script>
<style scoped>
.hello {
  width: 100%;
  height: 500px;
  background-color: #fff;
}
</style>