import { endsWith, insertCurrencySymbol, isNegative, isNumber, onlyDigits, removeLeadingZeros, startsWith, stripCurrencySymbol } from './stringUtils'

const isValidInteger = (integer, groupingSymbol) => integer.match(new RegExp(`^(0|[1-9]\\d{0,2}(\\${groupingSymbol}?\\d{3})*)$`))

const isFractionIncomplete = (value, { decimalSymbol, groupingSymbol }) => {
  const numberParts = value.split(decimalSymbol)
  return endsWith(value, decimalSymbol) && numberParts.length === 2 && isValidInteger(numberParts[0], groupingSymbol)
}

const checkIncompleteValue = (value, negative, previousConformedValue, currencyFormat, hideCurrencySymbol) => {
  let { negativePrefix, decimalSymbol, maximumFractionDigits } = currencyFormat
  if (value === '' && negative && previousConformedValue !== (hideCurrencySymbol ? currencyFormat.minusSymbol : negativePrefix)) {
    return insertCurrencySymbol('', currencyFormat, negative, hideCurrencySymbol)
  } else if (maximumFractionDigits > 0) {
    if (isFractionIncomplete(value, currencyFormat)) {
      return insertCurrencySymbol(value, currencyFormat, negative, hideCurrencySymbol)
    } else if (startsWith(value, decimalSymbol)) {
      return insertCurrencySymbol(`0${decimalSymbol}${(onlyDigits(value.substr(1)).substr(0, maximumFractionDigits))}`, currencyFormat, negative, hideCurrencySymbol)
    }
  }
  return null
}

const getAutoDecimalModeConformedValue = (str, previousConformedValue, minimumFractionDigits, allowNegative = true) => {
  if (str === '') {
    return { conformedValue: '' }
  } else {
    const negative = isNegative(str) && allowNegative
    const conformedValue = (allowNegative && str === '-')
      ? -0
      : Number(`${negative ? '-' : ''}${removeLeadingZeros(onlyDigits(str))}`) / Math.pow(10, minimumFractionDigits)
    return {
      conformedValue,
      fractionDigits: conformedValue.toFixed(minimumFractionDigits).slice(-minimumFractionDigits)
    }
  }
}

export default (str, currencyFormat, previousConformedValue = '', hideCurrencySymbol = false, autoDecimalMode = false, allowNegative = true) => {
  if (typeof str === 'string') {
    let value = stripCurrencySymbol(str, currencyFormat)
    if (currencyFormat.minimumFractionDigits > 0 && autoDecimalMode) {
      return getAutoDecimalModeConformedValue(value, previousConformedValue, currencyFormat.minimumFractionDigits, allowNegative)
    }

    let negative = isNegative(value)
    if (negative) {
      value = value.substring(1)
      negative &= allowNegative
    }
    const incompleteValue = checkIncompleteValue(value, negative, previousConformedValue, currencyFormat, hideCurrencySymbol)
    if (incompleteValue != null) {
      return { conformedValue: incompleteValue }
    }

    const [integer, ...fraction] = value.split(currencyFormat.decimalSymbol)
    const integerDigits = removeLeadingZeros(onlyDigits(integer))
    const fractionDigits = onlyDigits(fraction.join('')).substr(0, currencyFormat.maximumFractionDigits)
    const invalidFraction = fraction.length > 0 && fractionDigits.length === 0
    const invalidNegativeValue = integerDigits === '' && negative && (previousConformedValue === str.slice(0, -1) || previousConformedValue !== currencyFormat.negativePrefix)

    if (invalidFraction || invalidNegativeValue) {
      return { conformedValue: previousConformedValue }
    } else if (isNumber(integerDigits)) {
      return {
        conformedValue: Number(`${negative ? '-' : ''}${integerDigits}.${fractionDigits}`),
        fractionDigits
      }
    } else {
      return { conformedValue: '' }
    }
  }
  return { conformedValue: previousConformedValue }
}
