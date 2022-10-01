import Papa, { ParseResult } from 'papaparse'

export default class CSVParser {
  async parse(file: File): Promise<ParseResult<any>> {
    return new Promise(resolve => {
      Papa.parse<any>(file, { header: false, complete: (results, file) => resolve(results) })
    })
  }
}