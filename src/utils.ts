import {
  TextDocument,
  window,
  extensions,
  workspace,
  WorkspaceConfiguration,
} from 'vscode'
import {
  API,
  GitExtension, 
} from './git'
import { KNOWN_LANGUAGES } from './langs.json'
import moment from 'moment'
import path from 'path'

const system = window.createOutputChannel('vs-presence')

// https://github.com/iCrawl/discord-vscode/blob/9baf5262af2acb7e8f3c7ea2bb46914a513b3625/src/util.ts#L8
let git: API | null | undefined

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface VSPresenceConfiguration extends WorkspaceConfiguration {
  
}

export function getConfig(): VSPresenceConfiguration {
  return workspace.getConfiguration('vspresence') as VSPresenceConfiguration
}

export function getIcon(document: TextDocument): string {
  const filename = path.basename(document.fileName)
  const vscodeLang = KNOWN_LANGUAGES.find((lang) => lang.language === document.languageId)
  const byExtension = KNOWN_LANGUAGES.find((lang) => {
    const extension = lang.extension
    
    if (filename.endsWith(extension)) return true
    // https://stackoverflow.com/questions/17250815/how-to-check-if-the-input-string-is-a-valid-regular-expression
    const isRegex = /^\/.*\/(i|)$/.test(extension)
    if (!isRegex) return false
    const regex = new RegExp(extension.split("/")[1], extension.split("/")[2])

    return regex.test(filename)
  })
  
  return vscodeLang
    ? vscodeLang.image
    : byExtension
      ? byExtension.image
      : "file"
}

export function log(message: string | Error): void {
  const send = (msg: string): void => {
    system.appendLine(`(${moment().format("YYYY-MM-DD HH:mm:ss")}): ${msg}`)
  }
  if (typeof message === 'string') {
    send(message)
  } else if ("message" in message) {
    send(message.message)

    if (message.stack) {
      send(message.stack)
    }
  } else if (typeof message === 'object') {
    try {
      send(JSON.stringify(message, undefined, 2))
    } catch {}
  }
}

// https://github.com/iCrawl/discord-vscode/blob/9baf5262af2acb7e8f3c7ea2bb46914a513b3625/src/util.ts#L67
export async function getGit(): Promise<typeof git> {
  if (git || git === null) {
    return git
  }

  try {
    log('Loading git extension')
    const gitExtension = extensions.getExtension<GitExtension>('vscode.git')
    if (!gitExtension?.isActive) {
      log('Git extension not enabled, attempting to enable...')
      await gitExtension?.activate()
    }
    git = gitExtension?.exports.getAPI(1)
  } catch (error) {
    git = null
    log(`Failed to load git extension, is git installed?: ${error}`)
  }

  return git
}
