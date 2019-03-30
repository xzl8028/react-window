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

type ResizeObserverCallback = {
  // eslint-disable-next-line no-use-before-define
  (entries: Entries, observer: ResizeObserver): void,
};

declare class ResizeObserver {
  constructor(ResizeObserverCallback): ResizeObserver;
  observe(target: HTMLElement): void;
  unobserve(target: HTMLElement): void;
  disconnect(): void;
}

type ItemMeasurerProps = {|
  direction: Direction,
  handleNewMeasurements: HandleNewMeasurements,
  skipResizeClass: string,
  index: number,
  item: React$Element<any>,
  size: number,
  width: number,
|};

export default class ItemMeasurer extends Component<ItemMeasurerProps, void> {
  _node: HTMLElement | null = null;
  _resizeObserver: ResizeObserver | null = null;

  componentDidMount() {
    const node = ((findDOMNode(this): any): HTMLElement);
    this._node = node;

    // Force sync measure for the initial mount.
    // This is necessary to support the DynamicSizeList layout logic.
    this._measureItem(true);

    this._resizeObserver = new MutationObserver(this._onResize);
    this._resizeObserver.observe(node, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.width !== this.props.width) {
      this._onResize();
    }
  }

  componentWillUnmount() {
    const { onUnmount, itemId, index } = this.props;
    if (this._resizeObserver !== null) {
      this._resizeObserver.disconnect();
    }
    if (onUnmount) {
      onUnmount(itemId, index);
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

  _onResize = event => {
    const { skipResizeClass } = this.props;
    if (
      event &&
      skipResizeClass &&
      event.findIndex((el) => el.target && el.target.className && el.target.className.includes(skipResizeClass)) !== -1) {
      return;
    }

    this._measureItem(false);
  };
}
