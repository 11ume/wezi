import { composer, composerSingle } from 'wezi-composer'
import { createRouter, createRouterSpace } from 'wezi-router'
import { createApp } from './wezi'

export const wezi = createApp(composer)
export const router = createRouter(composer, composerSingle)
export const routerSpace = createRouterSpace(composer, composerSingle)
