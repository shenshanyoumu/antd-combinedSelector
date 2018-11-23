### 基于antd的高阶选择器： 

```js
const CombinedSelector = require('../src/combinedSelector').default;

//测试大数据量的列表结构
// const treeSelectorMockData=[];
// for(let i=0;i<4000;i++){
//   treeSelectorMockData.push({
//     key:`${i}`,
//     name:'测试'+i
//   })
// }

const treeSelectorMockData = [
  {
    name: '0-0',
    key: '0-0',
    children: [
      {
        name: '0-0-0',
        key: '0-0-0',
        children: [
          { name: '0-0-0-0', key: '0-0-0-0', checked: true },
          { name: '0-0-0-1', key: '0-0-0-1' },
          { name: '0-0-0-2', key: '0-0-0-2' },
        ],
      },
      {
        name: '0-0-1',
        key: '0-0-1',
        children: [
          { name: '0-0-1-0', key: '0-0-1-0', disabled: true },
          { name: '0-0-1-1', key: '0-0-1-1' },
          { name: '0-0-1-2', key: '0-0-1-2',children:[
            {name:'0-0-1-2-0',
            key:'0-0-1-2-0'}
          ] },
        ],
      },
      { name: '0-0-2', key: '0-0-2',checked:true,disabled:true },
    ],
  },
  {
    name: '0-1',
    key: '0-1',
    children: [
      {
        name: '0-1-0',
        key: '0-1-0',
        children: [
          { name: '0-1-0-0', key: '0-1-0-0' },
          { name: '0-1-0-1', key: '0-1-0-1' },
          { name: '0-1-0-2', key: '0-1-0-2' },
        ],
      },
      {
        name: '0-1-1',
        key: '0-1-1',
        children: [
          { name: '0-1-1-0', key: '0-1-1-0' },
          { name: '0-1-1-1', key: '0-1-1-1' },
          { name: '0-1-1-2', key: '0-1-1-2' },
        ],
      },
      { name: '0-1-2', key: '0-1-2' },
    ],
  },
  { name: '0-2', key: '0-2' },
];
initialState = {treeSelectorMultipleData: treeSelectorMockData,};

<CombinedSelector
  multiple
  width="320px"
  selectable={true}
  placement='topLeft'
  data={state.treeSelectorMultipleData}
  onBlurHandle={(selectedItems,selectedKeys)=>{ console.log('组件失焦后返回键值:', selectedKeys);
    console.log('组件失焦后返回数据:', selectedItems);}}
  handlerConfirmClick={(selectedItems,selectedKeys)=>{ console.log('组件失焦后返回键值:', selectedKeys);
    console.log('组件失焦后返回数据:', selectedItems);}}
  initialSelectedDetail={[]}
  fields={{
    key: 'key',
    title: 'name',
    children: 'children',
    checked: 'checked',
    disabled: 'disabled',
  }}
  customizedInfo = {{
    searchPlaceHolder: '请输入搜索信息',
    treeRootTitle: '全部',
    suffixMsg: ' 家书店',
    inputPlaceHolder: '请选择分组书店',
  }}
/>
```
