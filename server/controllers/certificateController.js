import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Generate Course Completion Certificate
export const generateCertificate = async (req, res) => {
  try {
    const { studentName, courseName, courseId } = req.body;

    if (!studentName || !courseName) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    // Directory to store certificates
    const certificatesDir = path.join(process.cwd(), "certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir);
    }

    // Unique filename
    const filename = `${courseId}-${Date.now()}.pdf`;
    const filePath = path.join(certificatesDir, filename);

    // Create the PDF
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 50,
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // 🎨 Background and Style
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8f9fa");
    doc.fillColor("#222").fontSize(36).font("Helvetica-Bold").text("Certificate of Completion", {
      align: "center",
      underline: true,
    });

    doc.moveDown(2);
    doc.fontSize(20).font("Helvetica").text("This is to certify that", { align: "center" });

    doc.moveDown(1);
    doc.fillColor("#007bff").fontSize(32).font("Helvetica-Bold").text(studentName, { align: "center" });

    doc.moveDown(1);
    doc.fillColor("#222").fontSize(20).text("has successfully completed the course", { align: "center" });

    doc.moveDown(1);
    doc.fillColor("#28a745").fontSize(28).font("Helvetica-Bold").text(courseName, { align: "center" });

    doc.moveDown(2);
    doc.fillColor("#444").fontSize(16).text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

    doc.moveDown(2);
    doc.fontSize(14).text("Authorized by EduPlatform", { align: "center" });

    // Optional Logo (if you have one)
    // const logoPath = path.join(process.cwd(), "assets", "logo.png");
    // if (fs.existsSync(logoPath)) {
    //   doc.image(logoPath, doc.page.width / 2 - 40, 50, { width: 80 });
    // }

    doc.end();

    writeStream.on("finish", () => {
      const certificateUrl = `${req.protocol}://${req.get("host")}/certificates/${filename}`;
      res.json({ success: true, certificateUrl });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Certificate generation failed." });
  }
};
