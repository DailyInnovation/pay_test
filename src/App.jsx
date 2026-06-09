import { useState, useCallback } from 'react'
import './App.css'

const BUTTONS = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

function calculate(a, op, b) {
  const x = parseFloat(a)
  const y = parseFloat(b)
  switch (op) {
    case '+': return x + y
    case '−': return x - y
    case '×': return x * y
    case '÷': return y !== 0 ? x / y : 'Error'
    default: return b
  }
}

function formatDisplay(value) {
  if (value === 'Error') return 'Error'
  const num = parseFloat(value)
  if (isNaN(num)) return '0'
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(4)
  }
  const str = value.toString()
  if (str.includes('.')) {
    const [int, dec] = str.split('.')
    return `${Number(int).toLocaleString()}.${dec}`
  }
  return num.toLocaleString()
}

export default function App() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [expression, setExpression] = useState('')

  const handleButton = useCallback((btn) => {
    if (btn === 'AC') {
      setDisplay('0')
      setPrev(null)
      setOperator(null)
      setWaitingForOperand(false)
      setExpression('')
      return
    }

    if (btn === '+/-') {
      setDisplay((d) => d === 'Error' ? '0' : String(parseFloat(d) * -1))
      return
    }

    if (btn === '%') {
      setDisplay((d) => d === 'Error' ? '0' : String(parseFloat(d) / 100))
      return
    }

    if (['+', '−', '×', '÷'].includes(btn)) {
      if (operator && !waitingForOperand) {
        const result = calculate(prev, operator, display)
        const resultStr = String(result)
        setDisplay(resultStr)
        setPrev(resultStr)
        setExpression(`${formatDisplay(resultStr)} ${btn}`)
      } else {
        setPrev(display)
        setExpression(`${formatDisplay(display)} ${btn}`)
      }
      setOperator(btn)
      setWaitingForOperand(true)
      return
    }

    if (btn === '=') {
      if (operator && prev !== null) {
        const result = calculate(prev, operator, display)
        const resultStr = String(result)
        setExpression(`${formatDisplay(prev)} ${operator} ${formatDisplay(display)} =`)
        setDisplay(resultStr)
        setPrev(null)
        setOperator(null)
        setWaitingForOperand(true)
      }
      return
    }

    if (btn === '.') {
      if (waitingForOperand) {
        setDisplay('0.')
        setWaitingForOperand(false)
        return
      }
      if (!display.includes('.')) {
        setDisplay((d) => d + '.')
      }
      return
    }

    if (waitingForOperand) {
      setDisplay(btn)
      setWaitingForOperand(false)
    } else {
      setDisplay((d) => d === '0' ? btn : d.length < 12 ? d + btn : d)
    }
  }, [display, prev, operator, waitingForOperand])

  const isOperator = (btn) => ['+', '−', '×', '÷'].includes(btn)

  return (
    <div className="calculator">
      <div className="display">
        <div className="expression">{expression || ' '}</div>
        <div className="value">{formatDisplay(display)}</div>
      </div>
      <div className="buttons">
        {BUTTONS.map((row, ri) => (
          <div key={ri} className="row">
            {row.map((btn) => (
              <button
                key={btn}
                className={[
                  'btn',
                  btn === '0' ? 'btn-zero' : '',
                  btn === '=' ? 'btn-equals' : '',
                  isOperator(btn) ? 'btn-operator' : '',
                  ['AC', '+/-', '%'].includes(btn) ? 'btn-function' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleButton(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
