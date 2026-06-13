import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const MENU_WIDTH = 140;
const MENU_HEIGHT = 130;

const ThreeDotMenu = ({ onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, flipUp: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const close = () => setOpen(false);

  const updatePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    let left = rect.right - MENU_WIDTH;
    let flipUp = false;
    let top = rect.bottom + 6;

    if (top + MENU_HEIGHT > window.innerHeight - 10) {
      top = rect.top - MENU_HEIGHT - 6;
      flipUp = true;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));
    top = Math.max(8, top);

    setPosition({ top, left, flipUp });
  };

  const toggle = () => {
    if (!open) updatePosition();
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e) => {
      if (
        menuRef.current?.contains(e.target) ||
        btnRef.current?.contains(e.target)
      ) {
        return;
      }
      close();
    };

    const handleScroll = () => close();
    const handleResize = () => close();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  const handleAction = (action) => {
    close();
    action();
  };

  const dropdown = open
    ? createPortal(
        <div
          ref={menuRef}
          className={`three-dot-dropdown three-dot-dropdown--portal ${position.flipUp ? 'flip-up' : ''}`}
          style={{ top: position.top, left: position.left }}
          role="menu"
        >
          <button type="button" role="menuitem" onClick={() => handleAction(onView)}>
            View
          </button>
          {onEdit && (
            <button type="button" role="menuitem" onClick={() => handleAction(onEdit)}>
              Edit
            </button>
          )}
          <button type="button" role="menuitem" className="danger" onClick={() => handleAction(onDelete)}>
            Delete
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="three-dot-menu">
      <button
        ref={btnRef}
        type="button"
        className="three-dot-btn"
        onClick={toggle}
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        &#8942;
      </button>
      {dropdown}
    </div>
  );
};

export default ThreeDotMenu;
