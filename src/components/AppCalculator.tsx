import React, { useState } from 'react';

export default function AppCalculator() {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [isEquationJustSolved, setIsEquationJustSolved] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === '0' || isEquationJustSolved) {
      setDisplay(digit);
      setIsEquationJustSolved(false);
    } else {
      setDisplay(prev => prev + digit);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
  };

  const handleSignToggle = () => {
    setDisplay(prev => {
      if (prev.startsWith('-')) {
        return prev.substring(1);
      } else if (prev !== '0') {
        return '-' + prev;
      }
      return prev;
    });
  };

  const handlePercent = () => {
    setDisplay(prev => String(Number(prev) / 100));
  };

  const setOp = (op: string) => {
    setPrevVal(Number(display));
    setOperation(op);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (prevVal === null || operation === null) return;
    const curr = Number(display);
    let res = 0;

    switch (operation) {
      case '+': res = prevVal + curr; break;
      case '-': res = prevVal - curr; break;
      case 'x': res = prevVal * curr; break;
      case '÷': 
        if (curr === 0) {
          setDisplay('Errore');
          handleClear();
          return;
        }
        res = prevVal / curr; 
        break;
      default: return;
    }

    setDisplay(String(Math.round(res * 100000) / 100000));
    setPrevVal(null);
    setOperation(null);
    setIsEquationJustSolved(true);
  };

  return (
    <div id="app-calculator" className="flex flex-col h-full w-full max-w-[280px] mx-auto bg-[#f4f4f4] dark:bg-black text-zinc-900 dark:text-white p-4 lg:p-5 rounded-[40px] select-none justify-end pb-8 transition-all duration-300">
      
      {/* Display */}
      <div className="text-right text-5xl font-light tracking-tight pr-2 mb-4 overflow-x-auto whitespace-nowrap scrollbar-none text-zinc-900 dark:text-white">
        {display}
      </div>

      {/* Button Grid layout */}
      <div className="grid grid-cols-4 gap-3 text-lg font-semibold">
        
        {/* Row 1 */}
        <button onClick={handleClear} className="aspect-square bg-zinc-300/80 dark:bg-zinc-300 text-black hover:bg-zinc-250 active:scale-95 rounded-full transition duration-150 flex items-center justify-center">
          AC
        </button>
        <button onClick={handleSignToggle} className="aspect-square bg-zinc-300/80 dark:bg-zinc-300 text-black hover:bg-zinc-250 active:scale-95 rounded-full transition duration-150 flex items-center justify-center">
          +/-
        </button>
        <button onClick={handlePercent} className="aspect-square bg-zinc-300/80 dark:bg-zinc-300 text-black hover:bg-zinc-250 active:scale-95 rounded-full transition duration-150 flex items-center justify-center">
          %
        </button>
        <button onClick={() => setOp('÷')} className={`aspect-square text-white active:scale-95 rounded-full transition duration-150 flex items-center justify-center ${operation === '÷' ? 'bg-[#ff9f0a] text-white ring-2 ring-zinc-400 dark:ring-white/40' : 'bg-[#ff9f0a] hover:bg-[#ffb53d]'}`}>
          ÷
        </button>

        {/* Row 2 */}
        <button onClick={() => handleDigit('7')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          7
        </button>
        <button onClick={() => handleDigit('8')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          8
        </button>
        <button onClick={() => handleDigit('9')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          9
        </button>
        <button onClick={() => setOp('x')} className={`aspect-square text-white active:scale-95 rounded-full transition duration-150 flex items-center justify-center ${operation === 'x' ? 'bg-[#ff9f0a] text-white ring-2 ring-zinc-400 dark:ring-white/40' : 'bg-[#ff9f0a] hover:bg-[#ffb53d]'}`}>
          x
        </button>

        {/* Row 3 */}
        <button onClick={() => handleDigit('4')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          4
        </button>
        <button onClick={() => handleDigit('5')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          5
        </button>
        <button onClick={() => handleDigit('6')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          6
        </button>
        <button onClick={() => setOp('-')} className={`aspect-square text-white active:scale-95 rounded-full transition duration-150 flex items-center justify-center ${operation === '-' ? 'bg-[#ff9f0a] text-white ring-2 ring-zinc-400 dark:ring-white/40' : 'bg-[#ff9f0a] hover:bg-[#ffb53d]'}`}>
          -
        </button>

        {/* Row 4 */}
        <button onClick={() => handleDigit('1')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          1
        </button>
        <button onClick={() => handleDigit('2')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          2
        </button>
        <button onClick={() => handleDigit('3')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          3
        </button>
        <button onClick={() => setOp('+')} className={`aspect-square text-white active:scale-95 rounded-full transition duration-150 flex items-center justify-center ${operation === '+' ? 'bg-[#ff9f0a] text-white ring-2 ring-zinc-400 dark:ring-white/40' : 'bg-[#ff9f0a] hover:bg-[#ffb53d]'}`}>
          +
        </button>

        {/* Row 5 */}
        <button onClick={() => handleDigit('0')} className="col-span-2 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-150 pl-5 text-left shadow-sm dark:shadow-none">
          0
        </button>
        <button onClick={() => handleDigit('.')} className="aspect-square bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-95 rounded-full transition duration-155 flex items-center justify-center shadow-sm dark:shadow-none">
          .
        </button>
        <button onClick={handleEquals} className="aspect-square bg-orange-500 hover:bg-orange-400 active:scale-95 rounded-full transition duration-150 flex items-center justify-center text-white">
          =
        </button>

      </div>
    </div>
  );
}
