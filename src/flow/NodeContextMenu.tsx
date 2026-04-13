import { type XYPosition } from '@xyflow/react';

import './nodeContextMenu.css';
import type { PatchGraphNodeHandle } from '@/types';

export type NodeContextMenuAction = {
  type: 'delete';
  nodeId: PatchGraphNodeHandle;
};

export type NodeContextMenuProps = {
  id: PatchGraphNodeHandle;
  onClick: (action: NodeContextMenuAction) => void;
  position: XYPosition;
};

export function NodeContextMenu({
  id,
  onClick,
  position,
}: NodeContextMenuProps) {
  return (
    <div
      className="picker-menu"
      style={{ position: 'fixed', left: position.x, top: position.y }}
    >
      <button
        type="button"
        className="picker-menu__item"
        onClick={() => {
          onClick({ type: 'delete', nodeId: id });
        }}
      >
        Delete
      </button>
    </div>
  );
}
