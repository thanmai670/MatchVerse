const fs = require('fs');
const path = require('path');

function printFolderStructure(dirPath, exclude = [], indent = '') {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        if (exclude.includes(file)) return;
        
        const fullPath = path.join(dirPath, file);
        const isDirectory = fs.lstatSync(fullPath).isDirectory();
        
        console.log(indent + (isDirectory ? '📁' : '📄') + ' ' + file);
        
        if (isDirectory) {
            printFolderStructure(fullPath, exclude, indent + '  ');
        }
    });
}

const excludeFolders = ['node_modules', 'dist', '.git', '.cache'];
printFolderStructure('./', excludeFolders);
