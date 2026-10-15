import { createRequire } from 'node:module'
import { resolve } from 'node:path'

// Test-only tools can live outside the checkout; see tests/README.md.
export const requireTool = createRequire(
  resolve(
    process.env['PHISIFY_TEST_TOOLS'] || '/tmp/phisify-validation',
    'package.json',
  ),
)
