<script setup lang="ts">
import { ref, onMounted, computed, watchEffect, onBeforeUnmount } from 'vue';
import InlineEditorHelper from './inline-editor-helper.ts';
import gf from './gridfox.ts';

InlineEditorHelper.keyboardNavigation();
const setActiveCell = InlineEditorHelper.setActiveCell;
const activeCell = computed(() => InlineEditorHelper.activeCell.value);

const key = localStorage.getItem('gf-apikey') || prompt('Paste key');
if (key) {
  gf.config(key);
  localStorage.setItem('gf-apikey', key);
}

const tables = ref([]);
const activeTable = ref({});
const tableData = ref({});

const setTable = async (t) => {
  activeTable.value = t;
  setActiveCell(null, null);
  const data = await gf.getTableRecords(t.name);
  tableData.value = data;
  InlineEditorHelper.setLimits(data.records.length, t.fields.length);
};

const fieldKey = (name: string) => {
  return name.charAt(0).toLowerCase() + name.slice(1);
};

const getRelatedData = () => {};

onMounted(async () => {
  tables.value = await gf.getAllTables();
  const [t] = tables.value;
  setTable(t);
});

onBeforeUnmount(() => {
  InlineEditorHelper.removeKeyboardListener();
});
</script>

<template>
  <div class="app">
    <div class="tabs">
      <div
        class="tab"
        v-for="table in tables"
        :key="table.name"
        :class="{ active: table.name === activeTable.name }"
        @click="setTable(table)"
      >
        {{ table.name }}
      </div>
      <div class="grow"></div>
    </div>
    <table v-if="activeTable.fields">
      <tr class="fields">
        <th
          v-for="cell in activeTable.fields"
          :title="JSON.stringify(cell)"
          :key="cell.name"
        >
          <div class="field-name">
            {{ cell.name }}
            <div class="order"></div>
          </div>
        </th>
        <th class="new-field"><div class="plus-icon"></div></th>
        <th class="spacer"></th>
      </tr>
      <tr
        v-for="(r, rowIndex) in tableData.records"
        :class="{ active: activeCell.row === rowIndex }"
      >
        <td
          v-for="(cell, cellIndex) in activeTable.fields"
          :key="cell.name + rowIndex"
          :[cell.type]="true"
          :class="{
            active:
              activeCell.row === rowIndex && activeCell.cell === cellIndex,
          }"
          @click="setActiveCell(rowIndex, cellIndex)"
        >
          <div
            class="value"
            contenteditable
            v-if="cell.type === 'richText'"
            v-html="r[fieldKey(cell.name)]"
          ></div>
          <div v-else-if="cell.type === 'parent'" class="value">
            {{ getRelatedData() }} {{ r[fieldKey(cell.name)] }}
          </div>
          <div v-else class="value">
            {{ r[fieldKey(cell.name)] }}
          </div>
        </td>
      </tr>
      <tr>
        <td class="add-new-row" :colspan="activeTable.fields.length">
          <div class="value plus-icon"></div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss">
@import './scss/_variables.scss';

*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: darken(#fff, 2%);
}

.grow {
  flex-grow: 1;
}

.app {
  width: 100%;
  height: 100vh;
  overflow: auto;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;

  .tabs {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
    color: #fff;
    background: #333;
    display: flex;

    .grow {
      background: #333;
    }

    .tab {
      padding: 0 20px;
      line-height: 40px;
      background: #333;
      cursor: pointer;

      &.active,
      &:hover {
        background: darken(#333, 5%);
        border-bottom: 1px solid #111;
      }
    }
  }

  table,
  th,
  td {
    border: 1px solid rgb(240, 240, 240);
    border-collapse: collapse;
  }

  table {
    border: 0;
    font-size: 0.9rem;
    width: 100%;

    th {
      font-weight: 400;
      border-width: 1px;
      padding: 10px;

      &:not(.spacer):hover {
        background: darken(#fff, 6%);
        cursor: pointer;
      }

      &.new-field {
        .plus-icon {
          margin: 0 50px;
        }
      }
    }

    .fields {
      position: sticky;
      top: 40px;
      z-index: 1;
      // box-shadow: 0 0 0 1px rgb(240, 240, 240);
    }

    th,
    td {
      background: #fff;
      white-space: nowrap;

      &.spacer {
        width: 100%;
      }

      .value {
        padding: 10px;
        min-height: 37px;
      }

      &[text] .value,
      &[richtext] .value {
        max-width: 400px;
        // white-space: normal;
        word-break: break-word;
      }
    }

    tr:hover td,
    tr.active td {
      background: darken(#fff, 2%);

      &.active {
        background: #fff;

        .value {
          position: relative;
          z-index: 88888;

          &:before {
            position: absolute;
            inset: -1px;
            border-radius: 2px;
            box-shadow: 0 0 0 2px $primary;
            content: '';
          }
        }
      }

      &.add-new-row {
        cursor: pointer;
      }
    }

    tr.active td {
      background: darken(#fff, 4%);
    }
  }

  .field-name {
    justify-content: space-between;
    align-items: center;
    display: flex;

    .order {
      width: 18px;
      height: 18px;
      margin-left: 30px;
      cursor: pointer;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      justify-content: center;
      align-items: center;
      display: flex;

      &:before {
        width: 4px;
        height: 4px;
        margin-top: -2px;
        border: solid gray;
        border-width: 0 1px 1px 0;
        transform: rotate(45deg);
        content: '';
      }

      &:hover {
        background: #444;
        &:before {
          border-color: #fff;
        }
      }
    }
  }

  .plus-icon {
    position: relative;
    margin: 0 4px;
    width: 18px;
    height: 18px;
    &:before,
    &:after {
      position: absolute;
      margin: auto;
      inset: 0;
      width: 10px;
      height: 2px;
      background: #222;
      content: '';
    }
    &:after {
      transform: rotate(90deg);
    }
  }
}
</style>
