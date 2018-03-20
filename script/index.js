import { ok } from 'assert'
import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { initOutput, packOutput, publishOutput } from 'dev-dep-tool/library/commonOutput'

import { modify } from 'dr-js/module/node/file/Modify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore' ] : 'inherit', shell: true }
const execOptionOutput = { cwd: fromOutput(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return

  logger.padLog(`copy bin`)
  await modify.copy(fromRoot('source-bin/index.js'), fromOutput('bin/index.js'))

  logger.padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  logger.padLog('verify output bin working')
  const outputBinTest = execSync('node bin --version', { ...execOptionOutput, stdio: 'pipe' }).toString()
  logger.log(`bin test output: ${outputBinTest}`)
  for (const testString of [ packageJSON.name, packageJSON.version ]) ok(outputBinTest.includes(testString), `should output contain: ${testString}`)

  await packOutput({ fromRoot, fromOutput, logger })

  await publishOutput({
    flagList: process.argv,
    packageJSON,
    onPublish: () => execSync('npm publish --tag latest --userconfig ~/thatbean.npmrc', execOptionOutput),
    onPublishDev: () => execSync('npm publish --tag dev --userconfig ~/thatbean.npmrc', execOptionOutput),
    logger
  })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
