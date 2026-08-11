#!/usr/bin/env node
/**
 * Replaces legacy Unicode nav icons with react-icons import references
 * across all page files that still use the old inline legacy sidebar nav.
 */

const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "src/pages");
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".js"));

// Map of old icon char → JSX component
const iconMap = {
  "◉": "<MdDashboard />",   // Dashboard
  "◎": "<MdPeople />",      // Customers (active)
  "◇": "<MdInventory2 />",  // Products
  "▣": "<MdWarehouse />",   // Inventory
  "≡": "<MdReceipt />",     // Challans
  "↗": "<MdBarChart />",    // Reports
};

const importLine = `import {\n  MdDashboard, MdPeople, MdInventory2, MdWarehouse,\n  MdReceipt, MdSupervisedUserCircle, MdBarChart\n} from "react-icons/md";\n`;

// Special case: Users uses ◉ same as Dashboard — we need to handle by context
// The approach: replace all ◉ inside nav-item-icon spans
// After replacing MdDashboard we do a second pass for Users pattern
// In legacy nav the Users button text follows ◉, let's do targeted replacement

let changed = 0;

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Skip if already uses MdDashboard (already updated)
  if (content.includes("MdDashboard")) {
    console.log(`⏭  Skipping ${file} (already updated)`);
    continue;
  }

  // Only process files that have the legacy nav-item-icon pattern
  if (!content.includes("nav-item-icon")) {
    console.log(`⏭  Skipping ${file} (no nav-item-icon)`);
    continue;
  }

  let modified = content;

  // Add import after the last existing import line (before first blank line after imports)
  // Find the import block end
  const importEnd = modified.lastIndexOf('\nimport ');
  const importEndLine = modified.indexOf('\n', importEnd + 1);
  modified =
    modified.slice(0, importEndLine + 1) +
    importLine +
    modified.slice(importEndLine + 1);

  // Replace icon symbols inside <span className="nav-item-icon"> blocks
  // We use a regex that matches the content between the span tags
  modified = modified.replace(
    /(<span className="nav-item-icon">\s*)◉(\s*<\/span>\s*\n\s*Dashboard)/g,
    '$1<MdDashboard />$2'
  );
  modified = modified.replace(
    /(<span className="nav-item-icon">\s*)◉(\s*<\/span>\s*\n\s*Users)/g,
    '$1<MdSupervisedUserCircle />$2'
  );
  modified = modified.replace(
    /(<span className="nav-item-icon">\s*)◎(\s*<\/span>)/g,
    '$1<MdPeople />$2'
  );
  modified = modified.replace(
    /(<span className="nav-item-icon">\s*)◇(\s*<\/span>)/g,
    '$1<MdInventory2 />$2'
  );
  modified = modified.replace(
    /(<span className="nav-item-icon">\s*)▣(\s*<\/span>)/g,
    '$1<MdWarehouse />$2'
  );
  modified = modified.replace(
    /(<span className="nav-item-icon">\s*)≡(\s*<\/span>)/g,
    '$1<MdReceipt />$2'
  );
  modified = modified.replace(
    /(<span className="nav-item-icon">\s*)↗(\s*<\/span>)/g,
    '$1<MdBarChart />$2'
  );

  if (modified !== content) {
    fs.writeFileSync(filePath, modified, "utf8");
    console.log(`✅ Updated ${file}`);
    changed++;
  } else {
    console.log(`ℹ️  No icon changes needed in ${file}`);
  }
}

console.log(`\nDone! Updated ${changed} file(s).`);
