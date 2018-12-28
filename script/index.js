import { resolve } from 'path'
import { execSync } from 'child_process'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/fileList'
import { argvFlag, runMain } from 'dr-dev/module/main'
import { initOutput, verifyOutputBinVersion, packOutput, publishOutput } from 'dr-dev/module/output'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog } = logger

  padLog(`generate spec`)
  execSync('npm rum script-generate-spec', execOptionRoot)

  const packageJSON = await initOutput({ copyMapPathList: [ [ 'source-bin/index.js', 'bin/index.js' ] ], fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return

  padLog(`build library`)
  execSync('npm rum build-library', execOptionRoot)

  padLog(`minify output`)
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)
  await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })

  await verifyOutputBinVersion({ packageJSON, fromOutput, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
})
