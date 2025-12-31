import { jsPDF } from 'jspdf';

const InvoicePDFGenerator = {
  createInvoice: (job, user) => {
    const doc = new jsPDF();

    // Company info
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(user?.company_name || 'Company Name', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    if (user?.phone) doc.text(user.phone, 20, 28);
    if (user?.address) doc.text(user.address, 20, 34);
    if (user?.email) doc.text(user.email, 20, 40);

    // INVOICE title
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 105, 30, { align: 'center' });

    // Invoice details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const invoiceNumber = `INV-${job.id?.slice(-6).toUpperCase() || '000000'}`;
    doc.text(`Invoice #: ${invoiceNumber}`, 140, 50);
    doc.text(`Date: ${new Date(job.scheduled_date).toLocaleDateString()}`, 140, 56);
    doc.text(`Status: ${job.payment_status || 'Unpaid'}`, 140, 62);

    // Bill To
    doc.setFont(undefined, 'bold');
    doc.text('BILL TO:', 20, 60);
    doc.setFont(undefined, 'normal');
    doc.text(job.customer_name, 20, 68);
    if (job.customer_address) doc.text(job.customer_address, 20, 74);
    if (job.customer_phone) doc.text(job.customer_phone, 20, 80);
    if (job.customer_email) doc.text(job.customer_email, 20, 86);

    // Service Details Table
    let yPos = 105;
    
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos, 170, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.text('Description', 25, yPos + 5);
    doc.text('Amount', 170, yPos + 5, { align: 'right' });
    
    yPos += 12;
    doc.setFont(undefined, 'normal');

    // Service type
    const serviceLabel = job.service_type === 'junk_removal' ? 'Junk Removal Service' :
                        job.service_type === 'lawn_care' ? 'Lawn Care Service' :
                        job.service_type === 'residential_cleaning' ? 'Cleaning Service' :
                        'Service';
    doc.text(serviceLabel, 25, yPos);
    doc.text(`$${(job.total_price || 0).toFixed(2)}`, 170, yPos, { align: 'right' });
    
    yPos += 8;

    // Job details
    if (job.items_description) {
      const splitText = doc.splitTextToSize(job.items_description, 120);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(splitText, 25, yPos);
      yPos += splitText.length * 5;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
    }

    // Total
    yPos += 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 8;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 140, yPos);
    doc.text(`$${(job.total_price || 0).toFixed(2)}`, 170, yPos, { align: 'right' });

    // Payment info
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Payment Status: ' + (job.payment_status === 'paid' ? 'PAID' : 'PENDING'), 20, yPos);

    // Notes
    if (job.completion_notes) {
      yPos += 10;
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      const notesSplit = doc.splitTextToSize(job.completion_notes, 170);
      doc.text(notesSplit, 20, yPos);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    // Save
    doc.save(`invoice-${invoiceNumber}.pdf`);
  }
};

export default InvoicePDFGenerator;