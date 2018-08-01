import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'
import { getScriptFileListFromPathList } from 'dev-dep-tool/library/fileList'
import { initOutput, verifyOutputBinVersion, packOutput, publishOutput } from 'dev-dep-tool/library/commonOutput'
import { getTerserOption, minifyFileListWithTerser } from 'dev-dep-tool/library/minify'

import { modify } from 'dr-js/module/node/file/Modify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog } = logger

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  padLog(`generate spec`)
  execSync('npm rum script-generate-spec', execOptionRoot)

  padLog(`copy bin`)
  await modify.copy(fromRoot('source-bin/index.js'), fromOutput('bin/index.js'))

  if (!argvFlag('pack')) return

  padLog(`build library`)
  execSync('npm rum build-library', execOptionRoot)

  padLog(`minify output`)
  await minifyFileListWithTerser({
    fileList: await getScriptFileListFromPathList([ '.' ], fromOutput),
    option: getTerserOption(),
    rootPath: PATH_OUTPUT,
    logger
  })

  await verifyOutputBinVersion({ packageJSON, fromOutput, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
