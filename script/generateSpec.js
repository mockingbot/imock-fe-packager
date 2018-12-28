import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { runMain } from 'dr-dev/module/main'
import { autoAppendMarkdownHeaderLink, renderMarkdownFileLink } from 'dr-dev/module/node/export/renderMarkdown'

import { indentLine } from 'dr-js/module/common/string'
import { formatUsage } from 'source/option'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownBinOptionFormat = () => [
  renderMarkdownFileLink('source/option.js'),
  '> ```',
  indentLine(formatUsage(), '> '),
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
}, 'generate-spec')
