declare module 'pdf2json' {
    interface PDFParser {
        on(event: 'pdfParser_dataError', callback: (errData: any) => void): void;
        on(event: 'pdfParser_dataReady', callback: (pdfData: any) => void): void;
        parseBuffer(buffer: Buffer): void;
    }

    class PDFParser {
        constructor();
    }

    export = PDFParser;
}

declare module 'pdf-lib' {
    export * from 'pdf-lib/types/api';
}