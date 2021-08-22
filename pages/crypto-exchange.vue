<template>
  <v-container>
    <v-row>
      <v-col class="text-center">
        <v-card color="red lighten-2">
          <v-card-title class="text-h5 red lighten-3">
            <v-row>
              <v-col align-self="center"> From Currency </v-col>
              <v-col>
                <v-select v-model="fromType" :items="['Crypto']"></v-select>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-if="fromType == 'Crypto'"
              v-model="fromCryptoCurrency"
              :items="fromCryptocurrencies"
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
                  label
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
            <v-text-field
              v-model="fromPhysicalCurrency"
              :rules="[() => !!fromType || 'This field is required']"
              :label="
                fromType == 'Crypto'
                  ? fromCryptoCurrency
                    ? fromCryptoCurrency.symbol
                    : ''
                  : 'USD'
              "
              required
              placeholder=""
              type="number"
            ></v-text-field>
          </v-card-text>
          <v-divider></v-divider>
        </v-card>
      </v-col>
      <v-col class="text-center">
        <v-card color="blue lighten-2">
          <v-card-title class="text-h5 blue lighten-3">
            <v-row>
              <v-col align-self="center"> To Currency </v-col>
              <v-col>
                <v-select v-model="toType" :items="exchangeType"></v-select>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="toCryptoCurrency"
              :items="toCryptocurrencies"
              :loading="isLoading"
              color="white"
              item-text="symbol"
              item-value="symbol"
              placeholder="Start typing to Search"
              prepend-icon="mdi-database-search"
              return-object
              :disabled="!fromCryptoCurrency || toType == 'Physical'"
            >
              <template v-slot:selection="{ attr, on, item, selected }">
                <v-chip
                  v-bind="attr"
                  :input-value="selected"
                  color="blue-grey"
                  class="white--text"
                  v-on="on"
                  label
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
      </v-col>
    </v-row>
    <div>
      <div class="d-flex justify-center my-6">
        <v-btn large color="primary" @click="convert" :disabled="!isValid">
          Convert
        </v-btn>
      </div>
    </div>
    <div
      class="d-flex justify-center"
      v-if="exchangeRate['1. From_Currency Code']"
    >
      <v-card class="col-8 m-auto">
        <v-card-title>Realtime Currency Exchange Rate</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-row class="mb-4">
            <v-col>
              <div class="d-flex mb-2">
                <h4>From_Currency Code</h4>
                <span class="mx-2">:</span>
                <h4>{{ exchangeRate['1. From_Currency Code'] }}</h4>
              </div>
              <div class="d-flex mb-2">
                <h4>From_Currency Name</h4>
                <span class="mx-2">:</span>
                <h4>{{ exchangeRate['2. From_Currency Name'] }}</h4>
              </div>
            </v-col>
            <v-col>
              <div class="d-flex mb-2">
                <h4>To_Currency Code</h4>
                <span class="mx-2">:</span>
                <h4>{{ exchangeRate['3. To_Currency Code'] }}</h4>
              </div>
              <div class="d-flex mb-2">
                <h4>To_Currency Name</h4>
                <span class="mx-2">:</span>
                <h4>{{ exchangeRate['4. To_Currency Name'] }}</h4>
              </div>
            </v-col>
          </v-row>
          <div class="d-flex justify-center">
            <h2>
              {{ exchangeRate['5. Exchange Rate'] * fromPhysicalCurrency }}
              {{ exchangeRate['3. To_Currency Code'] }}
            </h2>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import cryptocurrencies from './cryptocurrencies.json'
export default {
  data: () => ({
    fromType: 'Crypto',
    toType: 'Crypto',
    toCryptoCurrency: {
      symbol: 'ETH',
      name: 'Ethereum',
    },
    fromCryptoCurrency: {
      symbol: 'BTC',
      name: 'Bitcoin',
    },
    fromPhysicalCurrency: null,
    toPhysicalCurrency: null,
    fromCryptocurrencies: cryptocurrencies,
    isLoading: false,
    exchangeRate: {},
    exchangeType: ['Physical', 'Crypto'],
  }),

  computed: {
    isValid() {
      if (
        this.fromCryptoCurrency &&
        this.toCryptoCurrency &&
        this.fromPhysicalCurrency
      ) {
        return true
      } else {
        return false
      }
    },
    toCryptocurrencies() {
      if (this.fromCryptoCurrency) {
        return cryptocurrencies.filter(
          (item) => item.symbol != this.fromCryptoCurrency.symbol
        )
      }
    },
  },
  methods: {
    convert() {
      var fromParams =
        this.fromType == 'Physical' ? 'USD' : this.fromCryptoCurrency.symbol
      var toParams =
        this.toType == 'Physical' ? 'USD' : this.toCryptoCurrency.symbol
      console.log(
        this.$alpha.forex
          .rate(fromParams, toParams)
          .then(
            (exchangeData) =>
              (this.exchangeRate =
                exchangeData['Realtime Currency Exchange Rate'])
          )
      )
    },
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
}
</script>