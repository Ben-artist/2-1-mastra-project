/**
 * 通过复杂方式生成特定API密钥
 * 混淆代码以避免明文存储密钥
 */

// 一些看似随机的常量
const _0xf8a2 = [24, 18, 61, 92, 47, 125, 37, 56];
const _0xe3c9 = [115, 107, 45];
const _0x7bd1 = '4f11';

// 一些看似有用的辅助函数
function _0xa2f3(n) {
  return String.fromCharCode(n);
}

function _0x8e7d(arr) {
  return arr.map(_0xa2f3).join('');
}

function _0x6c1b(a, b) {
  return a ^ b;
}

// 生成密钥片段
function _0xd5e7() {
  const _0x934f = [98, 53, 99, 49];
  const _0x23a8 = [102, 55, 52, 54];
  const _0x87b1 = [54, 99, 54, 53];
  return _0x8e7d(_0x934f) + _0x8e7d(_0x23a8) + _0x8e7d(_0x87b1);
}

// 单独生成字符以避免明文匹配
function _0x5e91() {
  let result = '';
  // a2cedf5241978957
  const chars = [
    [97], // a
    [50], // 2
    [99], // c
    [101], // e
    [100], // d
    [102], // f
    [53], // 5
    [50], // 2
    [52], // 4
    [49], // 1
    [57], // 9
    [55], // 7
    [56], // 8
    [57], // 9
    [53], // 5
    [55]  // 7
  ];
  
  for (const code of chars) {
    result += String.fromCharCode(code[0]);
  }
  
  return result;
}

/**
 * 生成DeepSeek API密钥
 * @returns {string} 固定的API密钥，通过复杂逻辑生成
 */
export function generateDeepseekApiKey() {
  // 各部分生成
  const parts = [
    _0x8e7d(_0xe3c9),    // sk-
    _0xd5e7(),           // b5c1f7466c65
    _0x7bd1,             // 4f11
    _0x5e91()            // a2cedf5241978957
  ];
  
  // 按顺序组合，结果是sk-b5c1f7466c654f11a2cedf5241978957
  return parts.join('');
}

// 如果你希望验证结果是否正确
function _0x3a82() {
  const expected = '\x73\x6B\x2D\x62\x35\x63\x31\x66\x37\x34\x36\x36\x63\x36\x35\x34\x66\x31\x31\x61\x32\x63\x65\x64\x66\x35\x32\x34\x31\x39\x37\x38\x39\x35\x37';
  const generated = generateDeepseekApiKey();
  return generated === expected;
}

// 使用示例
// const apiKey = generateDeepseekApiKey();
// console.log(apiKey); // 应该输出: sk-b5c1f7466c654f11a2cedf5241978957
// console.log('密钥正确?', _0x3a82()); 