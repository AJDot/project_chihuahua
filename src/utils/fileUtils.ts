export function getFileList(e: Event): FileList | null {
  const target = e.target as HTMLInputElement
  return target?.files
}