import React from 'react';
import PropTypes from 'prop-types';
import BScroll from 'better-scroll';

import './index.less';

class ScrollWrap extends React.Component {
  static propTypes = {
    probeType: PropTypes.number,
    pullUpLoad: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    pullDownRefresh: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    onLoad: PropTypes.func,
    onRefresh: PropTypes.func,
    isOK: PropTypes.bool,
  };

  static defaultProps = {
    probeType: 0,
    isOK: false,
    pullUpLoad: true,
    pullDownRefresh: true,
  };

  _refs = {};

  scroll = null;

  state = {
    refreshing: false,
    loading: false,
  };

  componentDidMount() {
    this.initScroll();
  }

  componentWillUnmount() {
    this._refs = null;
    this.scroll.destroy();
    this.scroll = null;
  }

  initScroll = () => {
    const {
      probeType,
      pullUpLoad,
      onLoad,
      onRefresh,
      pullDownRefresh,
    } = this.props;

    if (!this._refs.scroll) return;

    const options = {
      click: true,
      tap: true,
      mouseWheel: true,
      probeType,
      pullUpLoad,
      pullDownRefresh,
    };

    this.scroll = new BScroll(this._refs.scroll, options);

    // 具备上拉加载数据的能力和回调
    if (pullUpLoad && onLoad) {
      this.scroll.on('pullingUp', () => {
        this.setState({
          loading: true,
        });
        onLoad();
      });
    }

    // 具备下拉加载数据的能力和回调
    if (pullDownRefresh && onRefresh) {
      this.scroll.on('pullingDown', () => {
        this.setState({
          refreshing: true,
        });
        onRefresh();
      });
    }
  };

  componentDidUpdate(prevProps) {
    const { isOK } = this.props;
    const { loading, refreshing } = this.state;
    if (isOK !== prevProps.isOK && isOK === true) {
      if (loading) {
        this.scroll.finishPullUp();
        this.scroll.refresh();
        this.setState({
          loading: false,
        });
      }

      if (refreshing) {
        this.scroll.finishPullDown();
        this.scroll.refresh();
        this.setState({
          refreshing: false,
        });
      }
    }
  }

  setScrollRef = element => {
    if (this._refs && !this._refs.scroll) {
      this._refs.scroll = element;
    }
  };

  render() {
    return (
      <div className="scroll-wrap" ref={this.setScrollRef}>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

export default ScrollWrap;
