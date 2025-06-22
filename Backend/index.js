const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const port = process.env.PORT || 8000;

// Create folders if not exist
["uploads", "files"].forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
});

app.use(cors());
app.use(express.json());

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Convert endpoint
app.post("/convertFile", upload.single("file"), (req, res) => {
    const inputPath = path.join(__dirname, req.file.path);
    const outputDir = path.join(__dirname, "files");

    const libreOfficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`; // ✅ your path
    const command = `${libreOfficePath} --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Conversion failed:", error);
            return res.status(500).json({ message: "Conversion failed" });
        }

        const pdfFilename = path.parse(req.file.originalname).name + ".pdf";
        const outputPath = path.join(outputDir, pdfFilename);

        res.download(outputPath, () => {
            console.log("✅ File downloaded");

            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
