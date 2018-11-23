import React from 'react';
import { Row, Button } from 'antd';
import ScrollWrapper from '../scrollWrapper';
import { splitRawData } from './utils/treeParser';

export default class SelectorList extends React.Component {
  static defaultProps = {
    clearTips: '移除',
    clearButton: '清空',
    okButton: '确认',
    prefixMsg: '已选择',
  };
  constructor(props) {
    super(props);
    const dataChunks = splitRawData(props.selectedLeaves, props.fields);
    this.state = {
      dataChunks,
      totalChunks: dataChunks.length,
      isDataReady: false,
      indicator: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedLeaves !== this.props.selectedLeaves) {
      const dataChunks = splitRawData(
        nextProps.selectedLeaves,
        nextProps.fields,
      );
      this.setState({
        dataChunks,
        totalChunks: dataChunks.length,
        indicator: 0,
      });
    }
  }

  // 在当前选中节点的分块列表中，根据选中节点渲染
  renderTags = (allLeaves, selectedLeaves, onRemove, fields) => {
    if (!selectedLeaves) return;
    return Object.keys(allLeaves).map(key => {
      if (selectedLeaves.includes(`${key}`)) {
        const currentNode = allLeaves[key];
        const tagName = currentNode[fields.title];
        return (
          <Row key={`${key}`} className="list__item">
            {!currentNode[fields.disabled] && (
              <a name={`${key}`} onClick={() => onRemove(`${key}`)}>
                {this.props.clearTips}
              </a>
            )}
            <div
              style={{
                width: '160px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {tagName}
            </div>
          </Row>
        );
      }
    });
  };

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

  render() {
    const {
      allLeaves,
      selectedLeaves,
      onRemoveAll,
      onRemove,
      handlerConfirmClick,
      checkedItemsNum,
      totalItemsNum,
      suffixMsg,
      prefixMsg,
      clearButton,
      okButton,
      fields,
    } = this.props;
    const { indicator, isDataReady, dataChunks } = this.state;
    const showRemoveAll = selectedLeaves.length > 0;

    return (
      <div className="tree-selector__list">
        <div className="list__content">
          <ScrollWrapper
            isOK={isDataReady}
            onLoad={this.onLoad}
            onRefresh={this.onRefresh}
          >
            {showRemoveAll ? (
              this.renderTags(
                allLeaves,
                dataChunks[indicator],
                onRemove,
                fields,
              )
            ) : (
              <div className="combined-selector" />
            )}
          </ScrollWrapper>
        </div>
        <div className="list__action">
          <span className="showMessage">
            {prefixMsg} <span className="selected">{checkedItemsNum}</span>
            {`/${totalItemsNum} ${suffixMsg}`}
          </span>
          {showRemoveAll && <a onClick={onRemoveAll}>{clearButton}</a>}
          <Button
            type="primary"
            className="confirm_btn"
            disabled={!showRemoveAll}
            onClick={handlerConfirmClick}
          >
            {okButton}
          </Button>
        </div>
      </div>
    );
  }
}
