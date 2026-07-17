import { Validator } from './validator';

function main() {
  const rubricRoot = process.argv[2] || '.';

  const validator = new Validator(rubricRoot);
  const violations = validator.validate();

  // Output violations
  for (const violation of violations) {
    console.log(`${violation.file}: ${violation.rule}: ${violation.message}`);
  }

  // Output summary
  const count = violations.length;
  console.log(`\nTotal violations: ${count}`);

  // Exit with appropriate code
  process.exit(count > 0 ? 1 : 0);
}

main();
