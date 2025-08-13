const renderMessage = (messageText, className, container) => {
  container.innerHTML = ''
  const message = document.createElement('p')
  message.className = `${className} text-xl`
  message.textContent = messageText
  container.appendChild(message)

}

const baseUrl = 'https://mindicador.cl/api'

const getIndicadores = async (indicador) => {
  try {
    const url = indicador ? `${baseUrl}/${indicador}` : baseUrl
    const resp = await fetch(url)
    const data = await resp.json()
    return data
  } catch (error) {
    renderMessage('Error en la petición intente nuevamente.', errorClasses, result)
    throw error
  }
}

const getCurrencyValue = async (currency) => {
  const data = await getIndicadores()
  let exchangeRate
  let currencyCode
  let currencySimbol
  switch (currency) {
    case 'USD':
      exchangeRate = data.dolar.valor
      currencyCode = data.dolar.codigo
      currencySimbol = '$'
      break;
    case 'EUR':
      exchangeRate = data.euro.valor
      currencyCode = data.euro.codigo
      currencySimbol = '€'
      break;
    default:
      renderMessage('Tipo de moneda no soportado.', errorClasses, result)
      throw new Error('Tipo de moneda no soportado.')
  }

  const series = await getChartData(currencyCode)

  return { exchangeRate, series, currencySimbol }
}

const getChartData = async (currencyCode) => {
  const data = await getIndicadores(currencyCode)
  const series = data.serie.slice(0, 10)
  return series
}

const chartContainer = document.querySelector('#chart-container')
const updateChart = (series) => {
  const labels = series.map(item => item.fecha.split('T')[0])
  const data = series.map(item => item.valor)

  chart.data.labels = labels
  chart.data.datasets[0].data = data
  chart.update()

  chartContainer.classList.remove('opacity-0')
}

const convertCurrency = async (amount, currency) => {
  const { exchangeRate, series, currencySimbol } = await getCurrencyValue(currency)
  const convertedAmount = amount / exchangeRate
  updateChart(series)
  return { convertedAmount, currencySimbol }
}

const currency_types = ['USD', 'EUR']
const errorClasses = 'text-center text-red-500 font-bold'

const selectCurrency = document.querySelector('#currency')
currency_types.forEach(currency => {
  const option = document.createElement('option')
  option.value = currency
  option.textContent = currency
  selectCurrency.appendChild(option)
})

const btnBuscar = document.querySelector('#convert')
const inputAmount = document.querySelector('#amount')
const result = document.querySelector('#result')

const updateBtnState = () => {
  const amountNumber = inputAmount.value * 1
  btnBuscar.disabled = (selectCurrency.value === 'Seleccione moneda') || (amountNumber <= 0) ? true : false
}

const handleConversion = async () => {
  const amount = inputAmount.value * 1
  const currency = selectCurrency.value

  const { convertedAmount, currencySimbol } = await convertCurrency(amount, currency)

  renderMessage(`Resultado: ${currencySimbol}${convertedAmount.toFixed(2)}`, 'text-center text-white font-bold', result)
}

selectCurrency.addEventListener('change', updateBtnState)
inputAmount.addEventListener('input', updateBtnState)
btnBuscar.addEventListener('click', handleConversion)


const ctx = document.getElementById('chart')

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Historial últimos 10 días',
      data: [],
      borderColor: 'rgba(255, 255, 255, 1)',
      labelColor: 'rgba(255, 255, 255, 1)',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
      , x: {
        beginAtZero: true,
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }

    }

  }
});
