/**
 * 创建一个防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 延迟时间(毫秒)
 * @returns {Function} 防抖处理后的函数
 */
export const debounce = (func, delay = 300) => {
  let timer = null;
  
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      func(...args);
    }, delay);
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  };
}; 