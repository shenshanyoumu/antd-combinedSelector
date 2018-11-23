import React from 'react';
import propTypes from 'prop-types';
import { Tooltip } from 'antd';

const TooltipWrapper = (props) => {
  const { name } = props;
  return <Tooltip
    title={name}
    placement="topLeft"
    overlay={name}
  >
    {name}
  </Tooltip>;
};


TooltipWrapper.propTypes = {
  name: propTypes.oneOfType([propTypes.string, propTypes.object]).isRequired,
};
export default TooltipWrapper;
