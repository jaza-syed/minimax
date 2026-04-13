import { type XYPosition } from '@xyflow/react';
import { FlowNodeMenuElements, type FlowNodeMenuElement } from './nodeRegistry';

import './nodeCreateMenu.css';

export type FlowNodeMenuProps = {
  onClick: (element: FlowNodeMenuElement) => void;
  position: XYPosition;
};

export function NodeCreateMenu({ onClick, position }: FlowNodeMenuProps) {
  return (
    <div
      className="picker-menu"
      style={{ position: 'fixed', left: position.x, top: position.y }}
    >
      {FlowNodeMenuElements.map((element) => (
        <button
          key={element.type}
          type="button"
          className="picker-menu__item"
          onClick={() => {
            onClick(element);
          }}
        >
          {element.label}
        </button>
      ))}
    </div>
  );
}
