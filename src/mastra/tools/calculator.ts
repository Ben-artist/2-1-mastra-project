import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// 基础计算器工具
export const calculatorTool = createTool({
  id: 'calculator',
  description: '基础计算器工具，支持加减乘除四则运算',
  inputSchema: z.object({
    firstNumber: z.number().describe('第一个数字'),
    secondNumber: z.number().describe('第二个数字'),
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('运算类型'),
  }),
  outputSchema: z.object({
    result: z.number().describe('计算结果'),
    expression: z.string().describe('运算表达式'),
    operationName: z.string().describe('运算类型名称')
  }),
  execute: async ({ context }) => {
    const { firstNumber, secondNumber, operation } = context;
    
    let result: number;
    let operationName: string;
    
    switch (operation) {
      case 'add':
        result = firstNumber + secondNumber;
        operationName = '加法';
        break;
      case 'subtract':
        result = firstNumber - secondNumber;
        operationName = '减法';
        break;
      case 'multiply':
        result = firstNumber * secondNumber;
        operationName = '乘法';
        break;
      case 'divide':
        if (secondNumber === 0) {
          throw new Error('除数不能为零！');
        }
        result = firstNumber / secondNumber;
        operationName = '除法';
        break;
      default:
        throw new Error('不支持的运算类型');
    }
    
    const expression = `${firstNumber} ${getOperationSymbol(operation)} ${secondNumber} = ${result}`;
    
    return {
      result,
      expression,
      operationName
    };
  },
});

function getOperationSymbol(operation: string): string {
  switch (operation) {
    case 'add': return '+';
    case 'subtract': return '-';
    case 'multiply': return '×';
    case 'divide': return '÷';
    default: return '?';
  }
}

/**
 * 高级计算器工具 - 支持更复杂的数学运算
 * 包括平方、平方根、百分比等
 */
export const advancedCalculatorTool = createTool({
  id: 'advanced-calculator',
  description: '高级计算器工具，支持平方、平方根、百分比等复杂运算',
  inputSchema: z.object({
    // 数字
    number: z.number().describe('要计算的数字'),
    // 高级运算类型
    operation: z.enum(['square', 'sqrt', 'percentage', 'absolute']).describe('高级运算类型：square(平方)、sqrt(平方根)、percentage(百分比)、absolute(绝对值)'),
    // 百分比计算的基准值（仅在percentage运算时需要）
    baseValue: z.number().optional().describe('百分比计算的基准值（仅在percentage运算时需要）')
  }),
  outputSchema: z.object({
    // 计算结果
    result: z.number().describe('计算结果'),
    // 运算表达式
    expression: z.string().describe('完整的运算表达式'),
    // 运算类型的中文描述
    operationName: z.string().describe('运算类型的中文名称'),
    // 计算过程说明
    explanation: z.string().describe('计算过程的详细说明')
  }),
  execute: async ({ context }) => {
    const { number, operation, baseValue } = context;
    
    let result: number;
    let operationName: string;
    let explanation: string;
    
    try {
      switch (operation) {
        case 'square':
          result = number * number;
          operationName = '平方';
          explanation = `${number} 的平方 = ${number} × ${number} = ${result}`;
          break;
          
        case 'sqrt':
          if (number < 0) {
            throw new Error('错误：不能计算负数的平方根！');
          }
          result = Math.sqrt(number);
          operationName = '平方根';
          explanation = `${number} 的平方根 = ${result}`;
          break;
          
        case 'percentage':
          if (baseValue === undefined) {
            throw new Error('错误：百分比计算需要提供基准值！');
          }
          if (baseValue === 0) {
            throw new Error('错误：基准值不能为零！');
          }
          result = (number / baseValue) * 100;
          operationName = '百分比';
          explanation = `${number} 占 ${baseValue} 的 ${result.toFixed(2)}%`;
          break;
          
        case 'absolute':
          result = Math.abs(number);
          operationName = '绝对值';
          explanation = `${number} 的绝对值 = ${result}`;
          break;
          
        default:
          throw new Error('不支持的高级运算类型');
      }
      
      // 构建完整的运算表达式
      const expression = `${operationName}(${number}) = ${result}`;
      
      return {
        result,
        expression,
        operationName,
        explanation
      };
      
    } catch (error) {
      throw new Error(`高级计算失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
});
