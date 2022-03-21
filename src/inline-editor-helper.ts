import { ref, nextTick } from 'vue';

class InlineEditorHelper {
  activeCell = ref<Record<string, null | number>>({ row: null, cell: null });
  limits = ref({ rowCount: 0, cellCount: 0 });

  constructor() {
    window.addEventListener('keydown', this.keyboardNavigation);
  }

  setActiveCell = async (rowIndex: null | number, cellIndex: null | number) => {
    this.activeCell.value.row = rowIndex;
    this.activeCell.value.cell = cellIndex;
    await nextTick();
    const el = document.querySelector('td.active');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  setLimits = (row: number, cell: number) => {
    this.limits.value.rowCount = row;
    this.limits.value.cellCount = cell;
  };

  removeKeyboardListener = () => {
    window.removeEventListener('keydown', this.keyboardNavigation);
  };

  keyboardNavigation = (e: KeyboardEvent) => {
    const { cellCount, rowCount } = this.limits.value;
    const { cell, row } = this.activeCell.value;
    if (row !== null && cell !== null) {
      switch (e.key) {
        case 'ArrowLeft':
          if (cell) this.setActiveCell(row, cell - 1);
          break;
        case 'ArrowRight':
        case 'Tab':
          e.preventDefault();
          if (cell + 1 < cellCount) this.setActiveCell(row, cell + 1);
          break;
        case 'ArrowUp':
          if (row) this.setActiveCell(row - 1, cell);
          break;
        case 'ArrowDown':
          if (row + 1 < rowCount) this.setActiveCell(row + 1, cell);
          break;
      }
    }
  };
}

export default new InlineEditorHelper();
