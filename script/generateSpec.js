import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'
import { autoAppendMarkdownHeaderLink, renderMarkdownFileLink } from 'dr-dev/module/ExportIndex/renderMarkdown'

import { stringIndentLine } from 'dr-js/module/common/format'
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
