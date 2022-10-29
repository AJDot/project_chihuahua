import Papa, { LocalFile, ParseResult } from 'papaparse'

export default class CSVParser {
  async parse(file: File | string): Promise<ParseResult<any>> {
    return new Promise(resolve => {
      Papa.parse<any, any>(file, { header: false, complete: (results: ParseResult<any>, file: LocalFile) => resolve(results) })
    })
  }
}