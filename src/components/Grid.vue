<script setup lang="ts">
import Commander from '@src/utils/commander'
import CSVParser from '@src/utils/csvParser'
import { getFileList } from '@src/utils/fileUtils'
import { ParseResult } from 'papaparse'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import FileStore from '../compositions/fileStore'
import DropZone from './DropZone.vue'
import PrimaryButton from './PrimaryButton.vue'
import SidePanel from './SidePanel.vue'

const { files, addFiles, removeAllFiles } = FileStore()

const csvResult = ref<ParseResult<ColorMapValue[]>>()
const currentValue = ref<ColorValue>()
const sidePanelOpen = ref<boolean>(false)
const commander = new Commander()

type ColorValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
type ColorMapValue = '' | ColorValue
const colorMap: Record<string, string> = {
  "": '#000000',
  0: '#000000',
  1: '#FFFFFF',
  2: '#00355E',
  3: '#00BAD6',
  4: '#009B95',
  5: '#00A51E',
  6: '#97C800',
  7: '#E7C987',
  8: '#FFA800',
  9: '#FF6D00',
  10: '#FE5F6B',
}

const colorButtonMap = ref<Record<ColorValue, { bg: string, text: string, class: string, total: number, used: number }>>({
  "0": { bg: colorMap[0], text: '#FFFFFF', class: 'col-span-5', total: 10_240, used: 0 },
  "1": { bg: colorMap[1], text: '#000000', class: 'col-span-1', total: 3_063, used: 0 },
  "2": { bg: colorMap[2], text: '#FFFFFF', class: 'col-span-1', total: 391, used: 0 },
  "3": { bg: colorMap[3], text: '#000000', class: 'col-span-1', total: 1_602, used: 0 },
  "4": { bg: colorMap[4], text: '#000000', class: 'col-span-1', total: 1_881, used: 0 },
  "5": { bg: colorMap[5], text: '#FFFFFF', class: 'col-span-1', total: 534, used: 0 },
  "6": { bg: colorMap[6], text: '#000000', class: 'col-span-1', total: 1_018, used: 0 },
  "7": { bg: colorMap[7], text: '#000000', class: 'col-span-1', total: 721, used: 0 },
  "8": { bg: colorMap[8], text: '#000000', class: 'col-span-1', total: 598, used: 0 },
  "9": { bg: colorMap[9], text: '#000000', class: 'col-span-1', total: 229, used: 0 },
  "10": { bg: colorMap[10], text: '#000000', class: 'col-span-1', total: 203, used: 0 },
})

function onInputChange(e: Event) {
  if (!e.currentTarget) return
  const target = e.currentTarget as HTMLInputElement

  const fileList = getFileList(e)

  if (fileList) importSheet(fileList)
  target.value = ''
}

async function importSheet(fileList: FileList) {
  if (!fileList.length) return

  addFiles([fileList[0]])
  const results = await new CSVParser().parse(files.value[0].file)
  loadData(results)
  removeAllFiles()
}

function loadData(data: ParseResult<ColorMapValue[]>) {
  csvResult.value = data
  for (const map of Object.values(colorButtonMap.value)) {
    map.used = 0
  }

  for (const row of csvResult.value.data) {
    for (let v of row) {
      updateCount(normalizeValue(v), 1)
    }
  }
}

function updateCount(value: ColorValue, change: number) {
  colorButtonMap.value[value].used += change
}

function setValue(r: number, c: number) {
  if (!csvResult.value?.data?.[r]) return
  if (!currentValue.value) return

  const oldValue = normalizeValue(csvResult.value.data[r][c])
  const newValue = currentValue.value

  if (newValue === oldValue) return

  commander.do({
    do() {
      if (!csvResult.value?.data?.[r]) return
      csvResult.value.data[r][c] = newValue
      updateCount(oldValue, -1)
      updateCount(newValue, 1)
    },
    undo() {
      if (!csvResult.value?.data?.[r]) return
      csvResult.value.data[r][c] = oldValue
      updateCount(oldValue, 1)
      updateCount(newValue, -1)
    },
  })
}

function toggleSlideover() {
  sidePanelOpen.value = !sidePanelOpen.value
}

function download() {
  if (!csvResult.value) throw new Error('Nothing to download')

  const csvContent = "data:text/csv;charset=utf-8," + csvResult.value.data.map(e => e.join(",")).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "my_data.csv")
  // document.body.appendChild(link) // Required for FF

  link.click() // This will download the data file named "my_data.csv".

}

function handleKeydown(e: KeyboardEvent) {
  switch (e.key.toUpperCase()) {
    case 'Z':
      if (e.ctrlKey && e.shiftKey) {
        commander.redo()
      } else if (e.ctrlKey) {
        commander.undo()
      }
      break
  }
}

onMounted(async () => {
  const file = await fetch("templates/Lego World Map Template.csv")
  const data = await file.text()
  loadData(await new CSVParser().parse(data))
  document.body.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.body.removeEventListener('keydown', handleKeydown)
})

let startTarget: HTMLDivElement | null
let endTarget: HTMLDivElement | null

function getPosition(element: HTMLDivElement) {
  const { r, c } = element.dataset

  if (!r || !c) return null

  return { r: parseInt(r, 10), c: parseInt(c, 10) }
}

function down(e: MouseEvent) {
  if (e.button === 0) {
    if (selection.value) return downSelectionMove(e)
    return downLine(e)
  }
  if (e.button === 2) return downSelect(e)
}

function downLine(e: MouseEvent) {
  e.preventDefault()

  if (!e.currentTarget) return

  const target = e.currentTarget as HTMLDivElement
  const { r, c } = target.dataset

  if (!r || !c) return

  startTarget = target
}

let startSelectTarget: HTMLDivElement | null = null
let endSelectTarget: HTMLDivElement | null = null

function downSelect(e: MouseEvent) {
  e.preventDefault()

  if (!e.currentTarget) return
  startSelectTarget = e.currentTarget as HTMLDivElement
}

let selectionMoveTarget: HTMLDivElement | null
function downSelectionMove(e: MouseEvent) {
  e.preventDefault()

  if (!e.currentTarget) return
  const target = e.currentTarget as HTMLDivElement
  const position = getPosition(target)

  if (!position || !selectionStart || !selectionEnd) return
  if (position.r >= selectionStart.r && position.r <= selectionEnd.r &&
    position.c >= selectionStart.c && position.c <= selectionEnd.c) {
    selectionMoveTarget = target
  } else {
    selectionStart = null
    selectionEnd = null
    if (selectionDiv) document.body.removeChild(selectionDiv)
    selectionDiv = null
  }
}

function up(e: MouseEvent) {
  if (startTarget) return upLine(e)
  if (startSelectTarget) return upSelect(e)
  if (selectionMoveTarget) return upSelectionMove(e)
}

function upLine(e: MouseEvent) {
  if (!e.currentTarget) return
  if (!startTarget) return

  const target = e.currentTarget as HTMLDivElement
  const { r, c } = target.dataset

  if (!r || !c) return

  endTarget = target

  const start = getPosition(startTarget)
  const end = getPosition(endTarget)

  if (start && end) line(start.r, start.c, end.r, end.c, setValue)

  startTarget = null
  endTarget = null
  tempLine.value = []
}

let originalSelection: string[][] | null
const selection = ref<ColorMapValue[][] | null>(null)
let selectionStart: { r: number, c: number } | null
let selectionEnd: { r: number, c: number } | null
function upSelect(e: MouseEvent) {
  if (!csvResult.value?.data) return
  if (startSelectTarget) selectionStart = getPosition(startSelectTarget)
  if (endSelectTarget) selectionEnd = getPosition(endSelectTarget)

  if (!selectionStart || !selectionEnd) return
  if (!selection.value) selection.value = []

  originalSelection = []
  for (let r = selectionStart.r; r <= selectionEnd.r; r++) {
    if (!selection.value[r]) selection.value[r] = []
    if (!originalSelection[r]) originalSelection[r] = []
    for (let c = selectionStart.c; c <= selectionEnd.c; c++) {
      selection.value[r][c] = csvResult.value.data[r][c]
      originalSelection[r][c] = selection.value[r][c]
    }
  }
  startSelectTarget = null
  endSelectTarget = null
}

function normalizeValue(v: ColorMapValue): ColorValue {
  return v === '' ? '0' : v
}

function upSelectionMove(e: MouseEvent) {
  if (!selection.value) return

  if (!originalSelection) return
  const doOriginalSelection: ColorValue[][] = []
  originalSelection.forEach((row, r) => {
    doOriginalSelection[r] = []
    row.forEach((col, c) => {
      if (!csvResult.value || !originalSelection) return
      doOriginalSelection[r][c] = normalizeValue(csvResult.value.data[r][c])
    })
  })

  const doSelection: ColorValue[][] = []
  const doOriginalDestinationSelection: ColorValue[][] = []
  selection.value.forEach((row, r) => {
    doSelection[r] = []
    doOriginalDestinationSelection[r] = []
    row.forEach((col, c) => {
      if (!csvResult.value || !selection.value) return
      doSelection[r][c] = normalizeValue(selection.value[r][c])
      doOriginalDestinationSelection[r][c] = normalizeValue(csvResult.value.data[r][c])
    })
  })


  if (!csvResult.value) return
  csvResult.value.data = csvResult.value.data.slice()
  selection.value = null
  originalSelection = null
  selectionMoveTarget = null
  if (selectionDiv) document.body.removeChild(selectionDiv)
  selectionDiv = null

  commander.do({
    do() {
      doOriginalSelection.forEach((row, r) => {
        row.forEach((col, c) => {
          if (!csvResult.value || !doOriginalSelection) return
          csvResult.value.data[r][c] = '0'
        })
      })

      doSelection.forEach((row, r) => {
        row.forEach((col, c) => {
          if (!csvResult.value || !doSelection) return
          csvResult.value.data[r][c] = doSelection[r][c]
        })
      })
    },
    undo() {
      doOriginalSelection.forEach((row, r) => {
        row.forEach((col, c) => {
          if (!csvResult.value) return
          csvResult.value.data[r][c] = doOriginalSelection[r][c]
        })
      })

      doOriginalDestinationSelection.forEach((row, r) => {
        row.forEach((col, c) => {
          if (!csvResult.value) return
          csvResult.value.data[r][c] = doOriginalDestinationSelection[r][c]
        })
      })
    },
  })
}

const tempLine = ref<string[][]>([])

function over(e: MouseEvent) {
  if (startTarget) return lineOver(e)
  if (startSelectTarget) return selectOver(e)
  if (selectionMoveTarget) return selectionOver(e)
}

function lineOver(e: MouseEvent) {
  if (!startTarget) return
  if (!e.currentTarget) return

  const target = e.currentTarget as HTMLDivElement
  const { r, c } = target.dataset

  if (!r || !c) return

  endTarget = target

  const start = getPosition(startTarget)
  const end = getPosition(endTarget)

  if (start && end) {
    tempLine.value = []
    line(start.r, start.c, end.r, end.c, (r, c) => {
      if (!currentValue.value) return
      if (!tempLine.value[r]) tempLine.value[r] = []

      tempLine.value[r][c] = currentValue.value
    })
  }
}

let selectionDiv: HTMLDivElement | null

function selectOver(e: MouseEvent) {
  if (!startSelectTarget) return
  if (!e.currentTarget) return

  const target = e.currentTarget as HTMLDivElement
  const { r, c } = target.dataset

  if (!r || !c) return

  endSelectTarget = target

  const { x: startX, y: startY } = startSelectTarget.getBoundingClientRect()
  const { x: endX, y: endY, width: endWidth, height: endHeight } = endSelectTarget.getBoundingClientRect()

  if (selectionDiv) document.body.removeChild(selectionDiv)
  const scrollContainer = target.closest('.overflow-auto')
  let top = startY
  top += window.scrollY
  let left = startX
  selectionDiv = document.createElement('div')
  selectionDiv.style.position = 'absolute'
  selectionDiv.style.top = `${top}px`
  selectionDiv.style.left = `${left}px`
  selectionDiv.style.width = `${endX - startX + endWidth}px`
  selectionDiv.style.height = `${endY - startY + endHeight}px`
  selectionDiv.classList.add('border-2', 'border-yellow-400')
  selectionDiv.style.pointerEvents = 'none'
  document.body.appendChild(selectionDiv)
}

function selectionOver(e: MouseEvent) {
  if (!e.currentTarget) return
  if (!selectionMoveTarget) return
  if (!selection.value) return

  const target = e.currentTarget as HTMLDivElement
  const end = getPosition(target)
  const start = getPosition(selectionMoveTarget)
  if (!start || !end) return
  const dr = end.r - start.r
  const dc = end.c - start.c
  const newSelection: ColorValue[][] = []
  selection.value.forEach((row, r) => {
    const newR = r + dr
    if (!newSelection[newR]) newSelection[newR] = []
    row.forEach((col, c) => {
      const newC = c + dc
      if (!selection.value) return
      newSelection[newR][newC] = normalizeValue(selection.value[r][c])
    })
  })
  selection.value = newSelection
  selectionMoveTarget = target
}

function line(x0: number, y0: number, x1: number, y1: number, callback: (x: number, y: number) => void) {
  var dx = Math.abs(x1 - x0)
  var dy = Math.abs(y1 - y0)
  var sx = (x0 < x1) ? 1 : -1
  var sy = (y0 < y1) ? 1 : -1
  var err = dx - dy

  while (true) {
    callback(x0, y0)

    if ((x0 === x1) && (y0 === y1)) break
    var e2 = 2 * err
    if (e2 > -dy) { err -= dy; x0 += sx }
    if (e2 < dx) { err += dx; y0 += sy }
  }
}

function colorValue(r: number, c: number, value: string): string {
  return tempLine.value?.[r]?.[c] || (selection.value?.[r]?.[c] !== undefined ? (selection.value?.[r]?.[c] === '' ? '0' : selection.value?.[r]?.[c]) : value)
}

</script>

<template>
  <div class="flex ">
    <SidePanel class="sticky shrink-0 top-0 left-0" v-if="sidePanelOpen" @close="toggleSlideover">
      <div class="grid grid-cols-1 px-4 pb-4">
        <div class="flex">
          <label for="file-input" class="cursor-pointer grow text-center">
            <div class="text-left text-lg font-bold">Upload CSV:</div>
            <DropZone @files-dropped="importSheet" class="" #default="{ active }">
              <div class="w-full h-fit px-4 py-2 rounded shadow-sm bg-yellow-200 border-yellow-400 border-2 hover:bg-yellow-100 hover:border-yellow-200" :class="active ? 'bg-yellow-100 border-yellow-200' : ''">
                <div>Drag and drop CSV here</div>
                <span class="text-sm">or <strong><em>click here</em> to select</strong></span>

                <input type="file" id="file-input" @change="onInputChange" class="hidden">
              </div>
            </DropZone>
          </label>
        </div>
        <div class="text-left text-lg font-bold mt-4">Colors:</div>
        <div class="grid grid-cols-5 gap-4">
          <div v-for="v, k in colorButtonMap" :class="v.class">
            <PrimaryButton class="w-full sm:w-full border" @click="currentValue = k" :style="`background-color: ${v.bg}; color: ${v.text}`" :class="`p-2 text-center ${k === currentValue ? 'ring-2 ring-yellow-500 ring-offset-2' : ''} cursor-pointer`">{{ k }}</PrimaryButton>
            <div class="bg-gray-200 rounded w-full sm:w-full text-center">
              <template v-if="k == '0'">
                Unset: {{ v.used }}
              </template>
              <template v-else>
                {{ v.total ? v.total - v.used : null }}
              </template>
            </div>
          </div>
        </div>
        <PrimaryButton @click="download" class="mt-4">Save</PrimaryButton>
        <ul class="mt-4">
          <span class="text-left text-lg font-bold mt-4">Instructions:</span>
          <li class="px-2 py-1">Upload a CSV or use the template loaded automatically.</li>
          <li class="px-2 py-1">The CSV should contain the strings "0" through "10", representing 11 colors.</li>
          <li class="px-2 py-1">Edit the grid by selecting a color in the settings menu and clicking a grid square.</li>
          <li class="px-2 py-1">Create lines by clicking and dragging from one square to another.</li>
          <li class="px-2 py-1">Move a section by right-clicking and dragging down-right to make the selection, then left-clicking and dragging to move it. The moved area is replaced with the "0" value color.</li>
          <li class="px-2 py-1">Undo/redo these operations with <code>ctrl+z</code>/<code>ctrl+shift+z</code>.</li>
          <li class="px-2 py-1">Download/export your file with the <kbd>Save</kbd> button.</li>
        </ul>
      </div>
    </SidePanel>
    <div class="p-6 overflow-auto">
      <div class="grid w-96 gap-4 my-4">
        <PrimaryButton @click="toggleSlideover" class="">Settings</PrimaryButton>
      </div>
      <div class="w-full my-4 bg-black">
        <div v-if="csvResult" class="flex flex-col overflow-auto">
          <div v-for="row, r in csvResult.data" class="flex">
            <div v-for="value, c in row" @mousedown="down" @mouseover="over" @mouseup="up" :data-r="r" :data-c="c" class="border border-gray-900" :class="{ 'border-r-gray-400': !((c + 1) % 16), 'border-b-gray-400': !((r + 1) % 16) }">
              <div @click="setValue(r, c)" :key="`${r}-${c}-${value}`" class="flex flex-nowrap shrink-0 w-5 h-5 border-solid justify-center items-center rounded-full" :style="`background-color: ${colorMap[colorValue(r, c, value)]};`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
