import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Input, Dropdown } from 'antd';

import SelectorList from './selectedContent';
import TreeModal from './TreeModal';
import { getAllLeaves } from './utils/treeParser';

import './index.less';

/**
 * 集成了树形选择器和展示列表的复合选择器
 * @example ../../markdown/combinedSelector.md
 */
export default class CombinedSelector extends React.Component {
  static displayName = 'CombinedSelector 组合选择器';

  static defaultProps = {
    multiple: false,
    data: [],
    width: '320px',
    fields: {},
    placement: 'bottomLeft',
    initialSelectedDetail: [],
  };

  static propTypes = {
    /** indicator for whether show select list */
    multiple: PropTypes.bool,
    /** tree-like array for render tree nodes */
    data: PropTypes.array.isRequired,
    /** when blur,return selected keys */
    onBlurHandle: PropTypes.func.isRequired,
    /** input width */
    width: PropTypes.string,
    /** call when click '确认' button  */
    handlerConfirmClick: PropTypes.func,
    /** default selected item key */
    initialSelectedDetail: PropTypes.array,
    /** mapping data key-value internally */
    fields: PropTypes.object,
    /** builtin info in the selector */
    customizedInfo: PropTypes.object,
    /** set position of the pop menu */
    placement: PropTypes.oneOf([
      'bottomLeft',
      'bottomCenter',
      'bottomRight',
      'topLeft',
      'topCenter',
      'topRight',
    ]),
  };

  fields = {
    key: 'key',
    title: 'name',
    children: 'children',
    checked: 'checked',
    disabled: 'disabled',
  };

  customizedInfo = {
    searchPlaceHolder: '请输入搜索信息',
    treeRootTitle: '全部',
    suffixMsg: ' 家书店',
    inputPlaceHolder: '请选择分组书店',
  };

  constructor(props) {
    super(props);
    this.customizedInfo = Object.assign(
      this.customizedInfo,
      props.customizedInfo,
    );

    this.fields = Object.assign(this.fields, props.fields);
    const inputBoxWidth = props.width || '160px';

    // 组件初始化时的默认选择的叶子节点
    const allLeaves = getAllLeaves(props.data, this.fields);
    const defaultCheckedKeys = Object.keys(allLeaves).filter(
      key =>
        allLeaves[key].checked ||
        (allLeaves[key].checked && allLeaves[key].disabled),
    );

    const initialSelectedLeaves = Array.from(
      new Set([...defaultCheckedKeys, ...props.initialSelectedDetail]),
    );

    this.state = {
      inputBoxWidth,
      dropdownBoxVisible: false,
      selectedLeaves: initialSelectedLeaves,
    };
  }

  // 当选择树形节点，则触发下面操作
  handleTagsChange = updatedSelectedLeaves => {
    this.setState({
      selectedLeaves: updatedSelectedLeaves,
    });
  };

  //清空操作不能作用于disabled状态的节点
  handleRemoveAll = () => {
    const { data } = this.props;
    const { selectedLeaves } = this.state;
    const allLeaves = getAllLeaves(data, this.fields);

    // disabled为true的不允许清除操作
    const filterResult = selectedLeaves.filter(
      key => allLeaves[key] && allLeaves[key].disabled,
    );

    this.setState({
      selectedLeaves: filterResult,
    });
  };

  // 从展示列表中删除某个选中节点
  handleRemove = key => {
    const { selectedLeaves } = this.state;
    const finedIndex = selectedLeaves.findIndex(itemKey => itemKey === key);

    if (finedIndex > -1) {
      selectedLeaves.splice(finedIndex, 1);
    }
    this.setState({
      selectedLeaves: [...selectedLeaves],
    });
  };

  // 失去焦点的处理逻辑
  handlerVisibleChange = visible => {
    if (!visible) {
      const { selectedLeaves } = this.state;
      const { onBlurHandle } = this.props;

      onBlurHandle(selectedLeaves);
    }
    this.setState({
      dropdownBoxVisible: visible,
    });
  };

  //点击确认按钮触发的行为
  handlerConfirmClick = () => {
    const { handlerConfirmClick } = this.props;
    const { selectedLeaves } = this.state;
    this.setState({
      dropdownBoxVisible: false,
    });
    if (handlerConfirmClick) {
      handlerConfirmClick(selectedLeaves);
    }
  };

  componentWillReceiveProps(nextProps) {
    if (
      // 接受新的数据集或者新的选择列表数据，则重新渲染选中叶子节点列表
      nextProps.initialSelectedDetail !== this.props.initialSelectedDetail ||
      nextProps.data !== this.props.data
    ) {
      // 组件初始化时的默认选择的叶子节点
      const allLeaves = getAllLeaves(nextProps.data, this.fields);
      const defaultCheckedKeys = Object.keys(allLeaves).filter(
        key =>
          allLeaves[key].checked ||
          (allLeaves[key].checked && allLeaves[key].disabled),
      );

      const initialSelectedLeaves = Array.from(
        new Set([...defaultCheckedKeys, ...nextProps.initialSelectedDetail]),
      );
      this.setState({
        selectedLeaves: initialSelectedLeaves,
      });
    }
  }

  render() {
    const { data, multiple, placement, customizedInfo } = this.props;

    const { selectedLeaves, dropdownBoxVisible, inputBoxWidth } = this.state;

    // 数据结构叶子节点总数，以及选中的叶子节点总数
    const allLeaves = getAllLeaves(data, this.fields);
    const totalItemsNum = Object.keys(allLeaves).length;
    const checkedItemsNum = selectedLeaves.length;

    const {
      suffixMsg,
      inputPlaceHolder,
      searchPlaceHolder,
      treeRootTitle,
    } = customizedInfo;

    const selectedMessage =
      `已选择${checkedItemsNum}/${totalItemsNum}` + suffixMsg;

    const dropdownBox = (
      <div className="selectorContainer">
        <div className={classnames('tree-selector', { multiple })}>
          <TreeModal
            className="tree-selector__content"
            treeData={data}
            handleTagsChange={this.handleTagsChange}
            selectedLeaves={selectedLeaves}
            fields={this.fields}
            searchPlaceHolder={searchPlaceHolder}
            treeRootTitle={treeRootTitle}
          />

          {multiple && (
            <SelectorList
              allLeaves={allLeaves}
              selectedLeaves={selectedLeaves}
              onRemoveAll={this.handleRemoveAll}
              onRemove={this.handleRemove}
              handlerConfirmClick={this.handlerConfirmClick}
              checkedItemsNum={checkedItemsNum}
              totalItemsNum={totalItemsNum}
              suffixMsg={suffixMsg}
              fields={this.fields}
            />
          )}
        </div>
      </div>
    );

    return (
      <Dropdown
        overlay={dropdownBox}
        trigger={['click']}
        visible={dropdownBoxVisible}
        onVisibleChange={this.handlerVisibleChange}
        placement={placement}
      >
        <Input
          value={checkedItemsNum ? selectedMessage : ''}
          placeholder={inputPlaceHolder}
          readOnly={true}
          style={{ width: inputBoxWidth, height: '30px' }}
        />
      </Dropdown>
    );
  }
}
