declare module "docx-parser" {
  export function parseDocx(buffer: Buffer): Promise<string>;
}

declare module "pdf-parse" {
  export interface PDFData {
    text: string;
    [key: string]: unknown;
  }

  // Assume the module exports the function as the default export
  declare function pdf(buffer: Buffer): Promise<PDFData>;

  export default pdf;
}
