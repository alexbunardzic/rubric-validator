import * as fs from 'fs';

export function parseGlossaryAnchors(filePath: string): Set<string> {
  const anchors = new Set<string>();

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match markdown headers that create anchors
    // Pattern: # Header or ## Subheader
    const headerRegex = /^#{1,6}\s+(.+)$/gm;
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
      const headerText = match[1].trim();
      // Convert header to anchor format (lowercase, replace spaces with hyphens)
      const anchor = headerText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      anchors.add(anchor);
    }
  } catch {
    // File doesn't exist or can't be read
  }

  return anchors;
}
