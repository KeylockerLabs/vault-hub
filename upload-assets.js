const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
require('dotenv').config();

// ADD THIS DEBUG LINE:
console.log('Debug Token:', process.env.BLOB_READ_WRITE_TOKEN ? 'Loaded successfully!' : 'NOT FOUND (Empty)');

// We point this to your top-level 'Files' directory
const LOCAL_FILES_DIR = path.join(__dirname, 'Files'); 
const OUTPUT_JSON_PATH = path.join(__dirname, 'blob-map.json');

// Recursive function to search all subfolders for PDF files
function getPdfFilesRecursively(dir, fileList = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // If the item is a folder, run the function again inside this subfolder!
            getPdfFilesRecursively(fullPath, fileList);
        } else if (item.endsWith('.pdf') || item.endsWith('.PDF')) {
            // If it is a PDF file, record its name and absolute path
            fileList.push({
                fileName: item,
                absolutePath: fullPath
            });
        }
    }
    return fileList;
}

async function uploadAllPdfs() {
    try {
        console.log('Scanning directories recursively for PDFs...');
        const pdfFiles = getPdfFilesRecursively(LOCAL_FILES_DIR);
        console.log(`Found ${pdfFiles.length} PDF file(s) across all folders.\n`);
        
        const urlMap = {};

        // Loop through all gathered PDF paths
        for (const fileInfo of pdfFiles) {
            const fileBuffer = fs.readFileSync(fileInfo.absolutePath);
            
            console.log(`Uploading: ${fileInfo.fileName}`);
            
            // Upload to Vercel Blob store
            const blob = await put(fileInfo.fileName, fileBuffer, {
                access: 'public',
                addRandomSuffix: true // Safeguards files with the same name
            });

            // Map the filename to its new secure URL
            urlMap[fileInfo.fileName] = blob.url;
            console.log(`Uploaded! URL: ${blob.url}\n`);
        }

        // Save everything to your JSON map
        fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(urlMap, null, 2));
        console.log(`Success! Created recursive mapping file at: ${OUTPUT_JSON_PATH}`);
    } catch (error) {
        console.error('Error during recursive upload pipeline:', error);
    }
}

uploadAllPdfs();