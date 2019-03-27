// @flow

import { Component } from 'react';
import { findDOMNode } from 'react-dom';

import type { Direction } from './createListComponent';
import type { HandleNewMeasurements } from './DynamicSizeList';

class DOMRectReadOnly {
  +x: number;
  +y: number;
  +width: number;
  +height: number;
  +top: number;
  +right: number;
  +bottom: number;
  +left: number;
}

class ResizeObserverEntry {
  +target: HTMLElement;
  +contentRect: DOMRectReadOnly;
}

type Entries = $ReadOnlyArray<ResizeObserverEntry>;

type DomChangeObserverCallback = {
  // eslint-disable-next-line no-use-before-define
  (entries: Entries, observer: ResizeObserver): void,
};

declare class domChangeObserver {
  constructor(DomChangeObserverCallback): domChangeObserver;
  observe(target: HTMLElement): void;
  unobserve(target: HTMLElement): void;
  disconnect(): void;
}

type ItemMeasurerProps = {|
  direction: Direction,
  handleNewMeasurements: HandleNewMeasurements,
  index: number,
  item: React$Element<any>,
  size: number,
  width: number,
|};

export default class ItemMeasurer extends Component<ItemMeasurerProps, void> {
  _node: HTMLElement | null = null;
  _domChangeObserver: domChangeObserver | null = null;
  _resizeAnimationFrame = null;

  componentDidMount() {
    const node = ((findDOMNode(this): any): HTMLElement);
    this._node = node;

    // Force sync measure for the initial mount.
    // This is necessary to support the DynamicSizeList layout logic.
    this._measureItem(true);

    this._domChangeObserver = new MutationObserver(this._onResize);
    this._domChangeObserver.observe(node, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    this._resizeAnimationFrame = window.requestAnimationFrame(() => {
      this.props.elementResizeDetector.listenTo(this._node, this._onResize);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.width !== this.props.width) {
      this._onResize();
    }
  }

  componentWillUnmount() {
    const { onUnmount, itemId, index } = this.props;
    this._domChangeObserver.disconnect();
    this.props.elementResizeDetector.uninstall(this._node);

    if (onUnmount) {
      onUnmount(itemId, index);
    }

    if (this._resizeAnimationFrame) {
      window.cancelAnimationFrame(this._resizeAnimationFrame);
    }
  }

  render() {
    return this.props.item;
  }

  _measureItem = (isCommitPhase: boolean) => {
    const {
      direction,
      handleNewMeasurements,
      size: oldSize,
      itemId,
    } = this.props;

    const node = this._node;

    if (
      node &&
      node.ownerDocument &&
      node.ownerDocument.defaultView &&
      node instanceof node.ownerDocument.defaultView.HTMLElement
    ) {
      const newSize =
        direction === 'horizontal'
          ? Math.ceil(node.offsetWidth)
          : Math.ceil(node.offsetHeight);

      if (oldSize !== newSize) {
        handleNewMeasurements(itemId, newSize, isCommitPhase);
      }
    }
  };

  _onResize = () => {
    this._measureItem(false);
  };
}
