import { ref } from 'vue'

export default function FileStore() {
  const files = ref<UploadableFile[]>([])

  function addFiles(newFiles: FileList | File[] | null) {
    if (!newFiles) return

    let newUploadableFiles = [...newFiles]
      .map(file => new UploadableFile(file))
      .filter(file => !fileExists(file.id))
    files.value = files.value.concat(newUploadableFiles)
  }

  function fileExists(otherId: string): boolean {
    return files.value.some(({ id }) => id === otherId)
  }

  function removeFile(file: UploadableFile) {
    const index = files.value.indexOf(file)

    if (index > -1) files.value.splice(index, 1)
  }

  function removeAllFiles() {
    files.value.splice(0, files.value.length)
  }

  return { files, addFiles, removeFile, removeAllFiles }
}

class UploadableFile {
  readonly id: string
  readonly url: string
  readonly status?: 'loading'
  constructor(public file: File) {
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`
    this.url = URL.createObjectURL(file)
  }
}