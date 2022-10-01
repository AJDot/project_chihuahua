<script setup lang="ts">
import DropZone from './DropZone.vue'
import FileStore from '../compositions/fileStore'
import CSVParser from '@src/utils/csvParser'
import { nextTick, ref } from 'vue'
import { ParseResult } from 'papaparse'
import { getFileList } from '@src/utils/fileUtils'
import PrimaryButton from './PrimaryButton.vue'
import SidePanel from './SidePanel.vue'

const { files, addFiles, removeAllFiles } = FileStore()

const csvResult = ref<ParseResult<string[]>>()
const currentValue = ref<string>()
const sidePanelOpen = ref<boolean>(false)

type ColorValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
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

const colorButtonMap: Record<ColorValue, { bg: string, text: string, class: string }> = {
  "0": { bg: colorMap[0], text: '#FFFFFF', class: 'col-span-5' },
  "1": { bg: colorMap[1], text: '#000000', class: 'col-span-1' },
  "2": { bg: colorMap[2], text: '#FFFFFF', class: 'col-span-1' },
  "3": { bg: colorMap[3], text: '#000000', class: 'col-span-1' },
  "4": { bg: colorMap[4], text: '#000000', class: 'col-span-1' },
  "5": { bg: colorMap[5], text: '#FFFFFF', class: 'col-span-1' },
  "6": { bg: colorMap[6], text: '#000000', class: 'col-span-1' },
  "7": { bg: colorMap[7], text: '#000000', class: 'col-span-1' },
  "8": { bg: colorMap[8], text: '#000000', class: 'col-span-1' },
  "9": { bg: colorMap[9], text: '#000000', class: 'col-span-1' },
  "10": { bg: colorMap[10], text: '#000000', class: 'col-span-1' },
}

function onInputChange(e: Event) {
  if (!e.target) return
  const target = e.target as HTMLInputElement

  const fileList = getFileList(e)

  if (fileList) importSheet(fileList)
  target.value = ''
}

async function importSheet(fileList: FileList) {
  if (!fileList.length) return

  addFiles([fileList[0]])
  const results = await new CSVParser().parse(files.value[0].file)
  csvResult.value = results

  removeAllFiles()
}

function setValue(r: number, c: number) {
  console.log(typeof r, typeof c)
  console.log(r, c)
  if (!csvResult.value?.data?.[r]) return
  if (!currentValue.value) return

  csvResult.value.data[r][c] = currentValue.value
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
</script>

<template>
  <div class="flex ">
    <SidePanel class="sticky shrink-0 top-0 left-0" v-if="sidePanelOpen" @close="toggleSlideover">
      <div class="grid grid-cols-1 p-4">
        <div class="flex ml-20 m-4">
          <label for="file-input" class="cursor-pointer">
            <DropZone @files-dropped="importSheet" class="" #default="{ active }">
              <div class="w-fit h-fit p-2 bg-yellow-200 border-yellow-400 border-2 hover:bg-yellow-100 hover:border-yellow-200" :class="active ? 'bg-yellow-100 border-yellow-200' : ''">
                <div>Drag and drop CSV here</div>
                <span class="text-sm">or <strong><em>click here</em> to select</strong></span>

                <input type="file" id="file-input" @change="onInputChange" class="hidden">
              </div>
            </DropZone>
          </label>
        </div>
        <div class="grid grid-cols-5 gap-4 my-4">
          <PrimaryButton @click="currentValue = k" v-for="v, k in colorButtonMap" :style="`background-color: ${v.bg}; color: ${v.text}`" :class="`p-2 ${v.class} text-center ${k === currentValue ? 'ring-2 ring-yellow-500 ring-offset-2' : ''} cursor-pointer`">{{k}}</PrimaryButton>
        </div>
        <PrimaryButton @click="download" class="">Download</PrimaryButton>
      </div>
    </SidePanel>
    <div class="p-6 overflow-auto">
      <div class="grid w-96 gap-4 my-4">
        <PrimaryButton @click="toggleSlideover" class="">Settings</PrimaryButton>
      </div>
      <div class="w-full my-4">
        <div v-if="csvResult" class="flex flex-col overflow-auto">
          <div v-for="row, r in csvResult.data" class="flex">
            <div @mousedown="setValue(r, c)" v-for="value, c in row" class="flex flex-nowrap shrink-0 w-5 h-5 border-solid border border-gray-800 justify-center items-center" :style="`background-color: ${colorMap[value]};`"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
