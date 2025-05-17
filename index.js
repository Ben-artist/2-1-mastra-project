/**
 * 将指定DOM元素转换为高清晰度图片并下载(全方位增强版)
 * @param {string} selector - CSS选择器，指定要转换的DOM元素
 * @param {string} [fileName='下载图片.png'] - 下载的文件名
 * @param {number} [scale=2] - 图片缩放比例，提高清晰度
 * @returns {Promise<void>}
 */
function downloadElementAsImage(selector, fileName = '下载图片.png', scale = 2) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    
    if (!element) {
      reject(new Error(`未找到选择器为 "${selector}" 的元素`));
      return;
    }
    
    // 计算元素内容的实际尺寸（包括溢出部分）
    const calculateFullSize = (el) => {
      // 获取所有子元素
      const children = Array.from(el.querySelectorAll('*'));
      
      // 初始尺寸为元素自身的滚动区域
      let maxWidth = el.scrollWidth;
      let maxHeight = el.scrollHeight;
      
      // 检查每个子元素的位置和尺寸
      children.forEach(child => {
        const rect = child.getBoundingClientRect();
        const right = child.offsetLeft + rect.width;
        const bottom = child.offsetTop + rect.height;
        
        if (right > maxWidth) maxWidth = right;
        if (bottom > maxHeight) maxHeight = bottom;
      });
      
      return { width: maxWidth, height: maxHeight };
    };
    
    // 保存原始状态
    const originalStyles = {
      overflow: element.style.overflow,
      overflowX: element.style.overflowX,
      overflowY: element.style.overflowY,
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      position: element.style.position,
      visibility: element.style.visibility,
      transform: element.style.transform,
      transformOrigin: element.style.transformOrigin
    };
    
    // 同时保存父元素原始样式
    let parentElements = [];
    let currentEl = element.parentElement;
    while (currentEl && currentEl !== document.body) {
      parentElements.push({
        element: currentEl,
        overflow: currentEl.style.overflow,
        width: currentEl.style.width,
        maxWidth: currentEl.style.maxWidth
      });
      currentEl = currentEl.parentElement;
    }
    
    // 临时修改样式确保所有内容可见
    const tempModifyStyles = () => {
      // 临时展开所有折叠元素
      const collapsedElements = element.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [hidden]');
      const expandedStates = [];
      
      collapsedElements.forEach(el => {
        expandedStates.push({
          element: el,
          display: el.style.display,
          visibility: el.style.visibility,
          hidden: el.hidden
        });
        
        if (window.getComputedStyle(el).display === 'none') {
          el.style.display = 'block';
        }
        el.style.visibility = 'visible';
        el.hidden = false;
      });
      
      // 计算完整尺寸
      const fullSize = calculateFullSize(element);
      
      // 确保所有内容都可见
      element.style.overflow = 'visible';
      element.style.overflowX = 'visible';
      element.style.overflowY = 'visible';
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.width = `${fullSize.width}px`;
      element.style.maxWidth = 'none';
      
      // 同时修改父元素样式以避免截断
      parentElements.forEach(parent => {
        parent.element.style.overflow = 'visible';
        parent.element.style.maxWidth = 'none';
      });
      
      return {
        expandedStates,
        fullSize
      };
    };
    
    // 恢复原始状态
    const restoreStyles = (state) => {
      // 恢复元素样式
      element.style.overflow = originalStyles.overflow;
      element.style.overflowX = originalStyles.overflowX;
      element.style.overflowY = originalStyles.overflowY;
      element.style.height = originalStyles.height;
      element.style.maxHeight = originalStyles.maxHeight;
      element.style.width = originalStyles.width;
      element.style.maxWidth = originalStyles.maxWidth;
      element.style.position = originalStyles.position;
      element.style.visibility = originalStyles.visibility;
      element.style.transform = originalStyles.transform;
      element.style.transformOrigin = originalStyles.transformOrigin;
      
      // 恢复父元素样式
      parentElements.forEach(parent => {
        parent.element.style.overflow = parent.overflow;
        parent.element.style.width = parent.width;
        parent.element.style.maxWidth = parent.maxWidth;
      });
      
      // 恢复折叠状态
      if (state.expandedStates) {
        state.expandedStates.forEach(state => {
          state.element.style.display = state.display;
          state.element.style.visibility = state.visibility;
          state.element.hidden = state.hidden;
        });
      }
    };
    
    // 使用当前页面已有的 html2canvas
    function captureAndDownload() {
      // 临时修改样式确保所有内容可见
      const state = tempModifyStyles();
      
      // 等待DOM更新
      setTimeout(() => {
        // 设置html2canvas选项
        const options = {
          scale: scale,                 // 提高分辨率
          useCORS: true,                // 允许加载跨域图片
          allowTaint: false,            // 不允许污染canvas
          backgroundColor: null,
          logging: true,                // 开启日志以便调试
          // 尝试捕获完整内容
          width: state.fullSize.width,  // 指定捕获的宽度
          height: state.fullSize.height,// 指定捕获的高度
          // 处理图片加载
          imageTimeout: 0,              // 禁用图片超时
          async: true,                  // 异步处理提高性能
          removeContainer: true,        // 移除临时容器
          onrendered: function(canvas) {
            // 恢复原始状态
            restoreStyles(state);
            
            try {
              // 尝试导出图片
              const imgData = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.download = fileName;
              link.href = imgData;
              link.click();
              resolve();
            } catch (e) {
              console.error("导出图片失败:", e);
              // 尝试备用方案 - 打开canvas在新窗口
              try {
                const newWindow = window.open();
                if (newWindow) {
                  newWindow.document.body.appendChild(canvas);
                  newWindow.document.title = "右键点击图片并选择'图片另存为'保存";
                  newWindow.document.body.style.textAlign = 'center';
                  const hint = newWindow.document.createElement('p');
                  hint.innerText = "右键点击图片并选择'图片另存为'保存";
                  newWindow.document.body.insertBefore(hint, canvas);
                  resolve();
                } else {
                  restoreStyles(state);
                  reject(new Error("无法打开新窗口，可能被浏览器阻止"));
                }
              } catch (e2) {
                restoreStyles(state);
                reject(new Error(`导出图片失败: ${e2.message}`));
              }
            }
          }
        };
        
        try {
          // 预处理图像，设置crossorigin属性
          const images = element.querySelectorAll('img');
          images.forEach(img => {
            if (!img.crossOrigin) {
              // 尝试处理图像跨域
              const originalSrc = img.src;
              img.crossOrigin = "anonymous";
              // 如果图片已经加载过，需要重新加载
              if (img.complete) {
                img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                setTimeout(() => {
                  img.src = originalSrc;
                }, 0);
              }
            }
          });
          
          // 尝试使用回调方式
          html2canvas(element, options);
        } catch (error) {
          restoreStyles(state);
          reject(new Error(`转换图片失败: ${error.message}`));
        }
      }, 200); // 给DOM更多时间来更新
    }
    
    // 检查html2canvas是否已加载
    if (typeof html2canvas === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      script.onload = () => captureAndDownload();
      script.onerror = () => reject(new Error('加载html2canvas库失败'));
      document.head.appendChild(script);
    } else {
      captureAndDownload();
    }
  });
}

// 基本用法
downloadElementAsImage('#myElement');

// 设置文件名和更高清晰度
downloadElementAsImage('.chart-container', '图表数据.png', 3);

// 使用Promise处理
downloadElementAsImage('.profile-card')
  .then(() => console.log('下载成功'))
  .catch(error => console.error('下载失败:', error));
