const fs = require('fs').promises;

async function exportToJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { exportToJson };
