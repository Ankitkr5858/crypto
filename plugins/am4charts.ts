
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themes_animated from '@amcharts/amcharts4/themes/animated'
export default ({ }, inject: any) => {
    am4core.useTheme(am4themes_animated)
    inject('am4core', am4core)
    inject('am4charts', am4charts)
}
