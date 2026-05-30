// Simple mock export using window.print for the ticket
class PdfExport {
  static exportElement(elementId, filename) {
    window.print();
  }
}

export default PdfExport;
