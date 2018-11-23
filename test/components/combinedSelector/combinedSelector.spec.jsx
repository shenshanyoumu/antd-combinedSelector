import React from 'react';
import renderer from 'react-test-renderer';
import CombinedSelector from '../../../src/combinedSelector';

const treeSelectorMockData = [
  {
    name: '0-0',
    key: '0-5',
    children: [
      {
        name: '面食',
        key: '0-0-0',
        children: [
          { name: '米粉', key: '0-0-0-0', disabled: true },
          { name: '味精', key: '0-0-0-1' },
          { name: '大蒜', key: '0-0-0-2' },
        ],
      },
      {
        name: '肉类',
        key: '0-0-1',
        children: [
          { name: '大肉', key: '0-0-1-0', disabled: true },
          { name: '中肉', key: '0-0-1-1' },
          { name: '小肉', key: '0-0-1-2' },
        ],
      },
      { name: '伪肉类', key: '0-0-2' },
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

describe('customized CombinedSelector combined treeSelect and selectList', () => {
  const handleBlur = jest
    .fn()
    .mockImplementation(() => console.log('失去焦点'));
  const handleConfirm = jest
    .fn()
    .mockImplementation(() => console.log('点击确认按钮'));

  it('test with demo in md', () => {
    const wrapper = renderer.create(
      <CombinedSelector
        multiple
        width="320px"
        selectable={true}
        placement="topLeft"
        data={treeSelectorMockData}
        onBlurHandle={handleBlur}
        handlerConfirmClick={handleConfirm}
        initialSelectedDetail={['0-1-1-0', '0-0-0-0']}
        fields={{
          key: 'key',
          title: 'name',
          children: 'children',
          checked: 'checked',
          disabled: 'disabled',
        }}
        customizedInfo={{
          searchPlaceHolder: '请输入搜索门店',
          treeRootTitle: '全部门店',
          suffixMsg: ' 家门店',
          inputPlaceHolder: '请选择分组门店',
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
