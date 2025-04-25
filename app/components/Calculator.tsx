"use client";
import React, { useState } from "react";

const Calculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("0");

  const handleInput = (value: string) => {
    if (value === "C") {
      setInput("");
      setResult("0");
    } else if (value === "=") {
      try {
        const decimalResult = evalToDecimal(input);
        const resultInBase7 = decimalToBase7(decimalResult);
        setInput(resultInBase7);
        setResult(resultInBase7);
      } catch (error) {
        console.error("Eval error:", error);
        setInput("Error");
        setResult("Error");
      }
    } else if (value === "⌫") {
      setInput(input.slice(0, -1));
    } else if (value === "+/-") {
      if (input.startsWith("-")) {
        setInput(input.substring(1));
      } else if (input !== "") {
        setInput("-" + input);
      }
    } else {
      // Cegah input angka di luar 0-6
      if (/^[0-6]$/.test(value) || ["+", "-", "*", "/", ",", "%"].includes(value)) {
        setInput(input + value);
        
        // Update real-time result if possible
        try {
          const newInput = input + value;
          if (/^[0-6+\-*/%,]+$/.test(newInput)) {
            const decimalValue = evalToDecimal(newInput);
            setResult(decimalToBase7(decimalValue));
          }
        } catch (error) {
          // Ignore calculation errors during input
        }
      }
    }
  };

  const evalToDecimal = (expression: string): number => {
    // Handle empty expression
    if (!expression) return 0;
    
    // Replace commas with dots for decimal points
    let processedExpression = expression.replace(/,/g, '.');
    
    // Periksa apakah ekspresi valid sebelum diproses
    const validExpression = /^[-+]?[0-6.+\-*/%()]+$/.test(processedExpression);
    if (!validExpression) {
      throw new Error("Invalid Expression");
    }

    // Convert base-7 numbers to decimal
    processedExpression = processedExpression.replace(/([0-6]+(\.[0-6]*)?)/g, (match) => {
      // Handle numbers with decimal points
      if (match.includes('.')) {
        const parts = match.split('.');
        const integerPart = parseInt(parts[0], 7);
        let fractionalValue = 0;
        
        if (parts[1]) {
          for (let i = 0; i < parts[1].length; i++) {
            fractionalValue += parseInt(parts[1][i], 7) / Math.pow(7, i + 1);
          }
        }
        
        return (integerPart + fractionalValue).toString();
      }
      
      // Handle integer numbers
      return parseInt(match, 7).toString();
    });

    // Handle modulo operations
    if (processedExpression.includes('%')) {
      const parts = processedExpression.split('%');
      if (parts.length !== 2) throw new Error("Invalid modulo expression");
      
      try {
        const left = Function(`"use strict"; return (${parts[0]})`)();
        const right = Function(`"use strict"; return (${parts[1]})`)();
        return left % right;
      } catch {
        throw new Error("Invalid Expression");
      }
    }

    // Safe evaluation of the expression
    try {
      return Function(`"use strict"; return (${processedExpression})`)();
    } catch (error) {
      console.error("Invalid Expression:", error);
      throw new Error("Invalid Expression");
    }
  };

  const decimalToBase7 = (num: number): string => {
    if (isNaN(num)) return "Error";
    if (num === 0) return "0";
    
    const isNegative = num < 0;
    num = Math.abs(num);
    
    // Handle integer part
    const integerPart = Math.floor(num);
    let integerResult = "";
    
    if (integerPart === 0) {
      integerResult = "0";
    } else {
      let temp = integerPart;
      while (temp > 0) {
        integerResult = (temp % 7) + integerResult;
        temp = Math.floor(temp / 7);
      }
    }
    
    // Handle decimal part
    const decimalPart = num - integerPart;
    if (decimalPart === 0) {
      return isNegative ? `-${integerResult}` : integerResult;
    }
    
    let decimalResult = ",";
    let fraction = decimalPart;
    const maxPrecision = 6; // Limit decimal precision
    
    for (let i = 0; i < maxPrecision && fraction !== 0; i++) {
      fraction *= 7;
      const digit = Math.floor(fraction);
      decimalResult += digit;
      fraction -= digit;
    }
    
    return isNegative ? `-${integerResult}${decimalResult}` : `${integerResult}${decimalResult}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
      <div className="bg-black rounded-xl shadow-2xl w-80 overflow-hidden">
        <div className="text-right px-4 pt-6 text-sm text-red-400">
          {input || "Ø"}
        </div>
        <div className="text-white text-right px-4 pb-6 text-4xl font-light">
          {result}
        </div>
        <div className="grid grid-cols-4 gap-2 bg-white rounded-t-3xl p-4">
          {[
            "%", "+/-", "C", "/",
            "1", "2", "3", "*",
            "4", "5", "6", "-",
            "0", ".", "⌫", "+"
          ].map((v) => (
            <CalcButton key={v} value={v} onClick={handleInput} />
          ))}
          <button 
            onClick={() => handleInput("=")} 
            className="text-lg font-semibold py-4 rounded-xl transition bg-pink-500 text-white col-span-4 hover:bg-pink-600"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

interface CalcButtonProps {
  value: string;
  onClick: (value: string) => void;
  label?: string;
}

const CalcButton: React.FC<CalcButtonProps> = ({ value, onClick, label }) => {
  const isOperator = ["/", "*", "-", "+"].includes(value);

  return (
    <button
      onClick={() => onClick(value)}
      className={`text-lg font-semibold py-4 rounded-xl transition
        ${isOperator
          ? "bg-purple-400 text-white hover:bg-purple-500"
          : ["C", "%", "+/-", "⌫"].includes(value)
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
          : "bg-white text-gray-800 hover:bg-gray-100"}`}
    >
      {label || value}
    </button>
  );
};

export default Calculator;