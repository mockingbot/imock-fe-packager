import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { argvFlag, runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'
import { autoAppendMarkdownHeaderLink, renderMarkdownFileLink } from 'dev-dep-tool/library/ExportIndex/renderMarkdown'

import { stringIndentLine } from 'dr-js/library/common/format'
import { formatUsage } from 'source/option'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownBinOptionFormat = () => [
  renderMarkdownFileLink('source/option.js'),
  '> ```',
  stringIndentLine(formatUsage(), '> '),
  '> ```'
]

runMain(async (logger) => {
  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...autoAppendMarkdownHeaderLink(
      '#### Bin Option Format',
      ...renderMarkdownBinOptionFormat()
    ),
    ''
  ].join('\n'))
}, getLogger('generate-spec', argvFlag('quiet')))
