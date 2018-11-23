const path = require('path');
module.exports = {
  pagePerSection: true,
  title: 'antd高阶组件',
  theme: {
    color: {
      link: '#314659',
      linkHover: '#5badfc',
      border: '#ebf5ff',
      sidebarBackground: '#fff',
    },
    sidebarWidth: 300,
    spaceFactor: 4,
    borderRadius: 5,
    maxWidth: 10000,
  },
  getComponentPathLine: function(componentPath) {
    return ``;
  },
  editorConfig: {
    theme: 'base16-dark',
    lineNumbers: true,
  },
  usageMode: 'expand',
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'styleguideLib/Wrapper.js'),
  },
  sections: [
    {
      name: '基于antd高阶组件',
      components: 'src/**/index.jsx',
      sectionDepth: 1,
    },
  ],
};
