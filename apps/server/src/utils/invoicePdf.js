import PDFDocument from "pdfkit";

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const generateInvoicePdf = (
  invoice,
  user,
  res
) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const fileName = `${invoice.invoiceNumber}.pdf`;

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}"`
  );

  doc.pipe(res);

  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("FreelanceFlow");

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#64748b")
    .text("Professional Freelance Invoice");

  doc.moveDown(2);

  doc
    .fillColor("#0f172a")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("INVOICE");

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(invoice.invoiceNumber);

  doc.moveDown(2);

  const informationTop = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("FROM", 50, informationTop);

  doc
    .font("Helvetica")
    .fontSize(11)
    .text(user.name, 50, informationTop + 20)
    .text(user.email, 50, informationTop + 36);

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("BILL TO", 300, informationTop);

  doc
    .font("Helvetica")
    .fontSize(11)
    .text(
      invoice.client.name,
      300,
      informationTop + 20
    );

  if (invoice.client.company) {
    doc.text(
      invoice.client.company,
      300,
      informationTop + 36
    );
  }

  if (invoice.client.email) {
    doc.text(
      invoice.client.email,
      300,
      informationTop + 52
    );
  }

  doc.y = informationTop + 90;

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#e2e8f0")
    .stroke();

  doc.moveDown(2);

  const detailTop = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#64748b")
    .text("INVOICE DATE", 50, detailTop);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#0f172a")
    .text(
      formatDate(invoice.createdAt),
      50,
      detailTop + 18
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#64748b")
    .text("BILLING PERIOD", 210, detailTop);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#0f172a")
    .text(
      `${formatDate(invoice.startDate)} - ${formatDate(
        invoice.endDate
      )}`,
      210,
      detailTop + 18
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#64748b")
    .text("STATUS", 450, detailTop);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#0f172a")
    .text(invoice.status, 450, detailTop + 18);

  doc.y = detailTop + 65;

  const tableTop = doc.y;

  doc
    .rect(50, tableTop, 495, 30)
    .fill("#0f172a");

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("DESCRIPTION", 60, tableTop + 10)
    .text("HOURS", 330, tableTop + 10)
    .text("RATE", 390, tableTop + 10)
    .text("AMOUNT", 470, tableTop + 10);

  let rowTop = tableTop + 40;

  invoice.items.forEach((item) => {
    const description =
      item.timeLog?.description ||
      item.timeLog?.project?.name ||
      "Billable work";

    doc
      .fillColor("#0f172a")
      .font("Helvetica")
      .fontSize(9)
      .text(description, 60, rowTop, {
        width: 250,
      });

    doc.text(
      Number(item.hours).toFixed(2),
      330,
      rowTop
    );

    doc.text(formatCurrency(item.rate), 390, rowTop, {
      width: 70,
    });

    doc.text(
      formatCurrency(item.amount),
      470,
      rowTop,
      {
        width: 75,
      }
    );

    rowTop += 30;

    doc
      .moveTo(50, rowTop - 8)
      .lineTo(545, rowTop - 8)
      .strokeColor("#e2e8f0")
      .stroke();
  });

  doc.y = rowTop + 15;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#0f172a")
    .text("TOTAL", 370, doc.y, {
      width: 80,
      align: "right",
    });

  doc
    .fontSize(16)
    .text(
      formatCurrency(invoice.totalAmount),
      450,
      doc.y - 14,
      {
        width: 95,
        align: "right",
      }
    );

  doc.moveDown(5);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748b")
    .text(
      "Thank you for your business. This invoice was generated using FreelanceFlow.",
      50,
      doc.y,
      {
        align: "center",
        width: 495,
      }
    );

  doc.end();
};