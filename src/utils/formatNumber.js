import numeral from 'numeral';

// ----------------------------------------------------------------------

export function fNumber(number) {
  return numeral(number).format();
}

export function fCurrency(number) {
  if (number == null) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

export function fPercent(number) {
  const format = number ? numeral(Number(number) / 100).format('0.0%') : '0%';

  return result(format, '.0');
}

export function fShortenNumber(number) {
  const format = number ? numeral(number).format('0.00a') : '0';

  return result(format, '.00');
}

export function fData(number) {
  const format = number ? numeral(number).format('0.0 b') : '0';

  return result(format, '.0');
}

function result(format, key = '.00') {
  const isInteger = format.includes(key);

  return isInteger ? format.replace(key, '') : format;
}
