import jsPDF from 'jspdf';

const QuotePDFGenerator = {
  generatePDF: (quote) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Company Logo/Name
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(quote.company?.company_name || 'Junk Removal Services', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    if (quote.company?.phone) {
      doc.text(quote.company.phone, 20, yPos);
      yPos += 5;
    }
    if (quote.company?.address) {
      doc.text(quote.company.address, 20, yPos);
      yPos += 5;
    }
    if (quote.company?.email) {
      doc.text(quote.company.email, 20, yPos);
    }
    
    yPos += 15;

    // Quote Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('QUOTE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Quote #: ${quote.quote_number}`, pageWidth / 2, yPos, { align: 'center' });
    doc.text(`Date: ${new Date(quote.created_date).toLocaleDateString()}`, pageWidth / 2, yPos + 5, { align: 'center' });
    yPos += 20;

    // Customer Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('CUSTOMER INFORMATION', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${quote.customer_name}`, 20, yPos);
    yPos += 6;
    if (quote.customer_address) {
      doc.text(`Address: ${quote.customer_address}`, 20, yPos);
      yPos += 6;
    }
    if (quote.customer_phone) {
      doc.text(`Phone: ${quote.customer_phone}`, 20, yPos);
      yPos += 6;
    }
    
    yPos += 10;

    // Job Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('JOB DETAILS', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Number of Loads: ${quote.load_count}`, 20, yPos);
    yPos += 8;

    doc.text('Items:', 20, yPos);
    yPos += 6;
    
    // Wrap items text
    const itemsLines = doc.splitTextToSize(quote.items_description, pageWidth - 40);
    doc.text(itemsLines, 20, yPos);
    yPos += itemsLines.length * 5 + 10;

    // Total (Customer sees clean price)
    doc.setDrawColor(200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL PRICE:', 20, yPos);
    doc.text(`$${quote.total.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100);
    doc.text('Includes: Labor, proper disposal, and volume-based pricing', 20, yPos);
    yPos += 15;

    // Notes
    if (quote.notes) {
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('ADDITIONAL NOTES:', 20, yPos);
      yPos += 6;
      
      doc.setFont(undefined, 'normal');
      const notesLines = doc.splitTextToSize(quote.notes, pageWidth - 40);
      doc.text(notesLines, 20, yPos);
      yPos += notesLines.length * 5 + 10;
    }

    // Footer
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text(
      'Thank you for your business! This quote is valid for 30 days.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );

    // Save
    doc.save(`Quote-${quote.quote_number}.pdf`);
  }
};

export default QuotePDFGenerator;