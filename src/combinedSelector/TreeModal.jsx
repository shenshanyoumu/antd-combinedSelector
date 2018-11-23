import React from 'react';
import { Input, Tree } from 'antd';
import ScrollWrapper from '../scrollWrapper';
import TooltipWrapper from './TooltipWrapper';
import {
  getSelectedStatus,
  getAllLeaves,
  getAncestorKeys,
  getMatchedNode,
  getDescentLeavesKeys,
  flateTree,
  getDescentKeys,
  filterTreebyKeys,
  splitRawData,
} from './utils/treeParser';

const TreeNode = Tree.TreeNode;
const Search = Input.Search;

class TreeModal extends React.Component {
  constructor(props) {
    super(props);

    // 根据当前选择状态，设置Tree节点的显示状态
    const { selectedLeaves, fields, treeData } = this.props;

    // todo：目前只针对一维数组进行了拆分处理，还需要对层次结构的数组拆分
    const dataChunks = splitRawData(treeData, fields);
    const totalChunks = dataChunks.length;

    this.state = {
      expandedKeys: [`$0-0`],
      autoExpandParent: true,
      searchValue: '',
      searchedTreeData: '',
      selectStatus: { checked: [], halfChecked: [] },

      dataChunks,
      totalChunks,
      isDataReady: false,
      indicator: 0,
    };

    // 创建虚拟的根节点
    const makeRoot = {
      [props.fields.key]: `$0-0`,
      [props.fields.children]: treeData,
    };

    // 根据初始选择的叶子节点来设置整棵树的节点显示状态
    if (selectedLeaves.length > 0) {
      this.state.selectStatus = getSelectedStatus(
        makeRoot,
        selectedLeaves,
        fields,
      );
    }
  }

  // 分块加载数据的逻辑
  onLoad = () => {
    const { totalChunks, indicator } = this.state;
    this.setState(
      {
        isDataReady: false,
      },
      () => {
        setTimeout(() => {
          this.setState({
            indicator: Math.min(indicator + 1, totalChunks - 1),
            isDataReady: true,
          });
        }, 500);
      },
    );
  };

  // 页面向上滚动，加载之前的数据
  onRefresh = () => {
    const { indicator } = this.state;
    this.setState(
      {
        isDataReady: false,
      },
      () => {
        setTimeout(() => {
          this.setState({
            indicator: Math.max(indicator - 1, 0),
            isDataReady: true,
          });
        }, 500);
      },
    );
  };

  // 过滤掉disabled属性为true的TreeNode
  filterDisabled = checked => {
    const { fields, treeData, selectedLeaves } = this.props;
    const allLeaves = getAllLeaves(treeData, fields);

    // 获取初始默认值后，过滤出disabled为true的值，这意味着用户不可取消。
    const defaultCheckedDisabled = [
      ...this.state.selectStatus.checked,
      ...selectedLeaves,
    ].filter(key => {
      return allLeaves[key] && allLeaves[key][fields.disabled];
    });

    // 从用户选中列表中，过滤掉disabled为true的值，这意味着用户不可选择
    const checkedNoDisabled = checked.filter(key => {
      return !(allLeaves[key] && allLeaves[key][fields.disabled]);
    });
    // 返回 用户不可取消的列表 和 用户选中的列表 的合集
    return defaultCheckedDisabled.concat(checkedNoDisabled);
  };

  // 点击Tree结构中节点的内容区触发处理行为
  handleNodeSelect = keyList => {
    const { selectedLeaves } = this.props;

    // 先判定该选中的节点是否已经被选中，从而决定选中或者取消选中的处理
    const hasBeenSelected = selectedLeaves.includes(keyList[0]);

    const updatedSelectedLeaves = hasBeenSelected
      ? selectedLeaves.filter(item => item !== keyList[0])
      : [].concat([...selectedLeaves, keyList[0]]);

    // 更新叶子节点选择集
    this.props.handleTagsChange(this.filterDisabled(updatedSelectedLeaves));
  };

  // 点击Tree结构中节点触发的处理行为
  handleNodeCheck = (checkedKeys, e) => {
    const { treeData, fields, handleTagsChange, selectedLeaves } = this.props;
    const { searchedTreeData, selectStatus } = this.state;
    const data = searchedTreeData || treeData;

    const eventKey = e.node.props.eventKey;

    // 创建根节点
    const makeRoot = { [fields.key]: `$0-0`, [fields.children]: data };

    // 找到当前点击node的树中位置
    const currentNode = getMatchedNode(eventKey, [makeRoot], fields);

    // 当前选中的节点所有后代叶子节点
    const descentLeavesKeys = getDescentLeavesKeys(
      `${currentNode[fields.key]}`,
      [currentNode],
      fields,
    );

    let checked;
    if (e.checked && !selectStatus.checked.some(x => x === eventKey)) {
      checked = Array.from(new Set([...descentLeavesKeys, ...selectedLeaves]));
    } else {
      const tmp = new Set(descentLeavesKeys);
      checked = selectedLeaves.filter(x => !tmp.has(x));
    }

    // 更新props
    handleTagsChange(this.filterDisabled(checked));

    this.setState({
      selectStatus: getSelectedStatus(makeRoot, checked, fields),
    });
  };

  componentWillReceiveProps(nextProps) {
    const { fields } = this.props;
    if (this.props.treeData !== nextProps.treeData) {
      const makeRoot = {
        [fields.key]: `$0-0`,
        [fields.children]: nextProps.treeData,
      };

      // 添加根节点到树中
      this.setState({
        expandedKeys: [`$0-0`],
        autoExpandParent: true,
        checkedKeys: nextProps.selectedLeaves || [],
        selectedKeys: [],
        searchValue: '',
        searchedTreeData: '',
        selectStatus: getSelectedStatus(
          makeRoot,
          nextProps.selectedLeaves,
          fields,
        ),
      });
    } else if (this.props.selectedLeaves !== nextProps.selectedLeaves) {
      const makeRoot = {
        [fields.key]: `$0-0`,
        [fields.children]: this.state.searchedTreeData || nextProps.treeData,
      };
      // 添加根节点到树中
      this.setState({
        selectStatus: getSelectedStatus(
          makeRoot,
          nextProps.selectedLeaves,
          fields,
        ),
      });
    }
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  renderData = (data, fields) => {
    const { dataChunks, totalChunks, indicator } = this.state;
    // 如果是一维度列表，则分块加载
    if (totalChunks) {
      return this.renderTreeNodes(dataChunks[indicator], fields);
    } else {
      // todo:大型树形结构性能待优化
      return this.renderTreeNodes(data, fields);
    }
  };

  // todo：当节点多时渲染性能非常差
  renderTreeNodes = (data, fields) =>
    data.map(item => {
      let realKey;

      const name = item[fields.title];
      const { searchValue } = this.state;
      const index = name.indexOf(searchValue);
      const beforeStr = name.substr(0, index);
      const afterStr = name.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span className="supply-component-multfilter--searched-text">
              {searchValue}
            </span>
            {afterStr}
          </span>
        ) : (
          <span>{name}</span>
        );
      realKey = item[fields.key];

      if (item[fields.children] && item[fields.children].length > 0) {
        return (
          <TreeNode
            disabled={item.disabled}
            title={<TooltipWrapper name={title} />}
            key={realKey}
          >
            {this.renderTreeNodes(item[fields.children], fields)}
          </TreeNode>
        );
      }

      return (
        true && (
          <TreeNode
            disabled={item[fields.disabled]}
            title={<TooltipWrapper name={title} />}
            key={`${realKey}`}
          />
        )
      );
    });

  onSearch = value => {
    const { treeData, selectedLeaves, fields } = this.props;

    const flattenList = flateTree(treeData, fields);
    const matchedKeys = flattenList
      .filter(node => node[fields.title].search(value) > -1)
      .map(node => node[fields.key]);

    // 下面流程用于找到匹配的节点的祖先节点和后代节点并合成
    const relatedAncestorKeys = [].concat(
      ...matchedKeys.map(key => getAncestorKeys(key, treeData, fields)),
    );
    const relatedDescentKeys = [].concat(
      ...matchedKeys.map(key => getDescentKeys(key, treeData, fields)),
    );

    const uniqueKeysSet = new Set(
      [].concat(...relatedAncestorKeys, ...matchedKeys, ...relatedDescentKeys),
    );

    const allRelatedKeys = Array.from(uniqueKeysSet);

    const newTreeData = filterTreebyKeys(allRelatedKeys, treeData, fields);

    const makeRoot = {
      [fields.key]: `$0-0`,
      [fields.children]: newTreeData || treeData,
    };

    // todo：目前只针对一维数组进行了拆分处理，还需要对层次结构的数组拆分
    const dataChunks = splitRawData(newTreeData, fields);
    const totalChunks = dataChunks.length;

    this.setState({
      isDataReady: false,
      indicator: 0,
      dataChunks,
      totalChunks,

      searchedTreeData: newTreeData,
      expandedKeys: relatedAncestorKeys.concat([...matchedKeys]),
      searchValue: value,
      autoExpandParent: true,
      selectStatus: getSelectedStatus(makeRoot, selectedLeaves, fields),
    });
  };

  render() {
    const {
      searchPlaceHolder,
      treeData,
      selectedLeaves,
      treeRootTitle,
      fields,
    } = this.props;
    const { searchedTreeData, selectStatus, isDataReady } = this.state;
    const data = searchedTreeData || treeData;

    return (
      <div className="supply-component-multfilter__content">
        <h2 className="supply-component-multfilter__title">
          {searchPlaceHolder}
        </h2>
        {treeData.length ? (
          <div className="supply-component-multfilter__right-content">
            <div className="supply-component-multfilter__search">
              <Search
                placeholder={`${searchPlaceHolder}`}
                onChange={e => this.onSearch(e.target.value)}
                value={this.state.searchValue}
              />
            </div>
            <div className="supply-component-multfilter__tree">
              <ScrollWrapper
                isOK={isDataReady}
                onRefresh={this.onRefresh}
                onLoad={this.onLoad}
              >
                <Tree
                  checkable
                  defaultExpandAll
                  checkStrictly
                  onExpand={this.onExpand}
                  expandedKeys={this.state.expandedKeys}
                  autoExpandParent={this.state.autoExpandParent}
                  onCheck={this.handleNodeCheck}
                  onSelect={this.handleNodeSelect}
                  checkedKeys={{
                    checked: [...selectedLeaves, ...selectStatus.checked] || [],
                    halfChecked: selectStatus.halfChecked || [],
                  }}
                >
                  <TreeNode title={treeRootTitle} key={`$0-0`}>
                    {this.renderData(data, fields)}
                  </TreeNode>
                </Tree>
              </ScrollWrapper>
            </div>
          </div>
        ) : (
          <div className="supply-component-multfilter--no-item">
            {`暂无${name}`}
          </div>
        )}
      </div>
    );
  }
}
export default TreeModal;
