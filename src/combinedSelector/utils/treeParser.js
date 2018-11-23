// 定义数据分块大小为50
const DATACHUNKSIZE = 50;

/**
 * 获得树形结构中所有叶子节点
 * @param {*} treeData 具有层次结构的数组
 * @param {*} fields 数组中元素节点的属性域
 */
const getAllLeaves = (treeData, fields) => {
  const leaves = {};

  const iterator = data => {
    data.forEach(item => {
      if (item[fields.children]) {
        iterator(item[fields.children]);
      } else {
        leaves[item[fields.key]] = item;
      }
    });
  };

  iterator(treeData);

  return leaves;
};

/**
 * 返回当前节点所有祖先节点的keys
 * @param {*} key 当前节点的key
 * @param {*} treeData 层级结构的数组
 * @param {*} fields 节点属性域
 */
const getAncestorKeys = (key, treeData, fields) => {
  const ancestorKeys = [];
  const tempKeys = [];
  let isStop = false;
  const iterator = data => {
    data.forEach(node => {
      const children = node[fields.children];
      const currentKey = node[fields.key];

      if (!isStop && children) {
        if (children.some(item => `${item[fields.key]}` === key)) {
          ancestorKeys.push(...tempKeys);
          ancestorKeys.push(`${currentKey}`);
          isStop = true;
        } else {
          tempKeys.push(`${currentKey}`);
          iterator(children);
        }
      }
    });

    tempKeys.pop();
  };

  iterator(treeData);

  return ancestorKeys;
};

/**
 * 返回当前节点所有后代节点的keys
 * @param {*} key 当前节点的key
 * @param {*} treeData 层级结构的数组
 * @param {*} fields 节点属性域
 */
const getDescentKeys = (key, treeData, fields) => {
  const descentKeys = [];

  const iterator = data => {
    data.forEach(node => {
      const children = node[fields.children];
      const currentKey = node[fields.key];
      descentKeys.push(`${currentKey}`);
      if (children) {
        iterator(children);
      }
    });
  };

  iterator([getMatchedNode(key, treeData, fields)]);

  return descentKeys.filter(nodeKey => nodeKey !== key);
};

/**
 * 返回当前节点所有子节点
 * @param {*} key 当前节点的key
 * @param {*} treeData 层级结构的数组
 * @param {*} fields 节点属性域
 */
const getDescentLeavesKeys = (key, treeData, fields) => {
  const descentLeavesKeys = [];

  const iterator = data => {
    data.forEach(node => {
      const children = node[fields.children];
      const currentKey = node[fields.key];

      if (children) {
        iterator(children);
      } else if (!node[fields.disabled]) {
        descentLeavesKeys.push(`${currentKey}`);
      }
    });
  };

  iterator([getMatchedNode(key, treeData, fields)]);

  // 包含当前节点本身
  return descentLeavesKeys;
};

/**
 * 返回给定key的节点对象
 * @param {*} key 当前节点的key
 * @param {*} treeData 层级结构的数组
 * @param {*} fields 节点属性域
 */
const getMatchedNode = (key, treeData, fields) => {
  let currentNode = {};
  let isStop = false;
  const iterator = data => {
    data.forEach(node => {
      const children = node[fields.children];
      const currentKey = node[fields.key];

      if (!isStop) {
        if (`${currentKey}` === key) {
          currentNode = node;
          isStop = true;
        } else if (children) {
          iterator(children);
        }
      }
    });
  };
  iterator(treeData);

  return currentNode;
};

/**
 * 根据叶子节点的选择状态，设置整棵树每个节点的显示状态-全选/半选
 * @param {*} rootNode 树形结构的根节点
 * @param {*} selectedLeaves 已选的叶子节点集合
 * @param {*} checked 受控树中，当所有后代节点选中，则该节点状态为全选状态
 * @param {*} halfChecked 受控树中，当存在后代节点选中，则该节点处于半选状态
 */
const getSelectedStatus = (
  rootNode,
  selectedLeaves,
  fields,
  checked = [],
  halfChecked = [],
) => {
  if (rootNode[fields.children]) {
    const allLeaves = getDescentLeavesKeys(
      rootNode[fields.key],
      [rootNode],
      fields,
    );

    const filterdLeaves = allLeaves.filter(
      key => !selectedLeaves.includes(key),
    );

    if (!filterdLeaves.length) {
      checked.push(rootNode[fields.key]);
    } else if (filterdLeaves.length < allLeaves.length) {
      halfChecked.push(rootNode[fields.key]);
    }

    const iterator = data => {
      data.forEach(node => {
        const currentKey = node[fields.key];
        const children = node[fields.children];

        // 当前节点所有后代叶子节点与已选叶子节点对比
        // 如果当前后代叶子节点还有未被选择，则设置为halfChecked
        const descentLeavesKeys = getDescentLeavesKeys(
          currentKey,
          [node],
          fields,
        );

        const remainLeaves = descentLeavesKeys.filter(
          key => !selectedLeaves.includes(key),
        );

        if (children) {
          if (!remainLeaves.length) {
            checked.push(`${currentKey}`);
          } else if (remainLeaves.length < descentLeavesKeys.length) {
            halfChecked.push(`${currentKey}`);
          }

          iterator(children);
        }
      });
    };

    iterator(rootNode[fields.children]);
  }
  return { checked, halfChecked };
};

/**
 * 将层次结构扁平化处理
 * @param {*} treeData 层次结构的数组
 * @param {*} fields 树形结构节点属性域
 */
const flateTree = (treeData, fields) => {
  const flattenList = [];

  const iterator = data => {
    data.forEach(node => {
      const children = node[fields.children];
      const currentKey = node[fields.key];
      const currentTitle = node[fields.title];
      flattenList.push({
        [fields.key]: `${currentKey}`,
        [fields.title]: currentTitle,
      });

      if (children) {
        iterator(children);
      }
    });
  };
  iterator(treeData);
  return flattenList;
};

/**
 * 根据给定的keys列表和原有树，过滤构造新的树
 * @param {*} keys 用于过滤的key列表
 * @param {*} treeData 层次结构的数组
 * @param {*} fields 构造树形节点的属性域
 */
const filterTreebyKeys = (keys, treeData, fields) => {
  const iterator = data => {
    const newTree = [];
    data.forEach(node => {
      const children = node[fields.children];
      const currentKey = node[fields.key];

      if (keys.includes(`${currentKey}`)) {
        if (children) {
          newTree.push({
            ...node,
            children: iterator(children),
          });
        } else {
          newTree.push({
            ...node,
          });
        }
      }
    });

    return newTree;
  };

  return iterator(treeData);
};

/**
 * 将数据模型拆分为若干小的数据块，缓解大数据集下DOM渲染压力
 * @param {*} listData 一维列表数据
 * @param {*} roundNum 数据块尺寸约数
 */
const splitRawData = (Data, fields, roundNum = DATACHUNKSIZE) => {
  const dataChunks = [];
  const isPlainList = Data.filter(item => item[fields.children]).length === 0;

  // 如果是普通的一维列表，则直接拆分即可
  if (isPlainList) {
    let oneChunk = [];
    let counter = 0;
    Data.forEach(item => {
      if (counter++ <= roundNum) {
        oneChunk.push(item);
      } else {
        dataChunks.push([...oneChunk]);
        counter = 0;
        oneChunk = [];
      }
    });
    dataChunks.push([...oneChunk]);
  } else {
    // todo:层次结构的数组如何拆分？？
  }

  return dataChunks;
};

export {
  getAllLeaves,
  getAncestorKeys,
  getDescentKeys,
  getMatchedNode,
  getSelectedStatus,
  getDescentLeavesKeys,
  flateTree,
  filterTreebyKeys,
  DATACHUNKSIZE,
  splitRawData,
};
