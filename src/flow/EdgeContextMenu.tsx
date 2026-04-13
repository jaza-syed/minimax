import type { XYPosition } from '@xyflow/react';

import './nodeContextMenu.css';
import type { PatchGraphPortId } from '@/types';

export type EdgeContextMenuAction = {
  type: 'delete';
  edgeId: string;
  outlet: PatchGraphPortId;
  inlet: PatchGraphPortId;
};

export type EdgeContextMenuProps = {
  edgeId: string;
  outlet: PatchGraphPortId;
  inlet: PatchGraphPortId;
  onClick: (action: EdgeContextMenuAction) => void;
  position: XYPosition;
};

export function EdgeContextMenu({
  edgeId,
  outlet,
  inlet,
  onClick,
  position,
}: EdgeContextMenuProps) {
  return (
    <div
      className="picker-menu"
      style={{ position: 'fixed', left: position.x, top: position.y }}
    >
      <button
        type="button"
        className="picker-menu__item"
        onClick={() => {
          onClick({ type: 'delete', edgeId, outlet, inlet });
        }}
      >
        Delete
      </button>
    </div>
  );
}
