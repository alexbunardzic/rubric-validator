interface ThresholdEntry {
  id: string;
  status: string;
  core: boolean;
}

export function parseThresholds(content: string): ThresholdEntry[] {
  const entries: ThresholdEntry[] = [];

  // Simple parser for markdown table format
  // Expected format:
  // | ID | Status | Core |
  // |----|--------|------|
  // | SPEC-01 | active | true |
  const lines = content.split('\n');

  let inTable = false;
  for (const line of lines) {
    // Skip header and separator lines
    if (line.includes('---') || !line.includes('|')) {
      continue;
    }

    if (!line.trim()) {
      inTable = false;
      continue;
    }

    // Parse table rows
    const parts = line.split('|').map((p) => p.trim()).filter((p) => p.length > 0);

    if (parts.length >= 3) {
      const id = parts[0];
      const status = parts[1].toLowerCase();
      const coreStr = parts[2].toLowerCase();
      const core = coreStr === 'true' || coreStr === 'yes' || coreStr === 'x';

      // Validate this looks like a criterion ID
      if (/^[A-Z]+-\d+$/.test(id)) {
        entries.push({ id, status, core });
      }
    }
  }

  return entries;
}

export function extractCoreIds(entries: ThresholdEntry[]): Set<string> {
  return new Set(entries.filter((e) => e.core).map((e) => e.id));
}
