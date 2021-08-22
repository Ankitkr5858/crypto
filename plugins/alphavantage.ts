import alphavantage from 'alphavantage'
export default ({  }, inject: any) => {
    const alpha = alphavantage({ key: process.env.apikey || '' });
    inject('alpha', alpha)
}
