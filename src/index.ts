import { Client } from 'discord-rpc'
import {
  commands,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  window,
  workspace,
  debug, 
} from 'vscode'
import {
  log,
  getConfig,
  getGit,
} from './utils'
import {
  CLIENT_ID,
} from './constants'
import throttle from 'lodash-es/throttle'

const vsStatus: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left)
vsStatus.text = '$(loading) Connecting To RPC'

let rpc = new Client({ transport: 'ipc' })
const config = getConfig()

let state = {}
let interval: NodeJS.Timeout | undefined
let idle: NodeJS.Timeout | undefined
let listeners: { dispose(): unknown }[] = []

export function cleanUp(): void {
  for (const listener of listeners) listener.dispose()
  listeners = []
  if (interval) clearInterval(interval)
}
