import type { AssetRef, WallTextureArray } from '../types.js'
import bulletPlasmaUrl from './images/bullet-plasma.png'
import decorationCrystalsUrl from './images/decoration-crystals.png'
import enemyGuardUrl from './images/enemy-guard.png'
import enemyWalk1Url from './images/enemy-walk-1.png'
import enemyWalk2Url from './images/enemy-walk-2.png'
import enemyWalk3Url from './images/enemy-walk-3.png'
import wallMetalUrl from './images/wall-metal.png'
import wallStoneUrl from './images/wall-stone.png'

type AssetManifest = {
  images: Record<string, string>
  wallTextures: Record<number, AssetRef>
}

export const ASSET_IDS = {
  walls: {
    stone: 'wall.stone',
    metal: 'wall.metal',
  },
  sprites: {
    enemyGuard: 'sprite.enemy.guard',
    enemyWalk1: 'sprite.enemy.walk.1',
    enemyWalk2: 'sprite.enemy.walk.2',
    enemyWalk3: 'sprite.enemy.walk.3',
    decoration: 'sprite.decoration.greenArmor',
    bullet: 'sprite.projectile.bullet',
    redKeycard: 'sprite.pickup.redKeycard',
    greenKeycard: 'sprite.pickup.greenKeycard',
  },
} as const

const redKeycardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
  <rect x="1" y="1" width="62" height="38" rx="6" fill="#b61212" stroke="#ffe1e1" stroke-width="2"/>
  <rect x="9" y="9" width="22" height="8" rx="2" fill="#ffe1e1"/>
  <circle cx="49" cy="20" r="6" fill="#ffe1e1"/>
  <rect x="41" y="28" width="16" height="4" rx="2" fill="#ffe1e1"/>
</svg>`

const greenKeycardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
  <rect x="1" y="1" width="62" height="38" rx="6" fill="#168a2f" stroke="#e3ffe9" stroke-width="2"/>
  <rect x="9" y="9" width="22" height="8" rx="2" fill="#e3ffe9"/>
  <circle cx="49" cy="20" r="6" fill="#e3ffe9"/>
  <rect x="41" y="28" width="16" height="4" rx="2" fill="#e3ffe9"/>
</svg>`

const missingAssetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#ff00ff"/>
  <path d="M0 0 L64 64 M64 0 L0 64" stroke="#111" stroke-width="6"/>
</svg>`

export const assetManifest: AssetManifest = {
  images: {
    [ASSET_IDS.walls.stone]: wallStoneUrl,
    [ASSET_IDS.walls.metal]: wallMetalUrl,
    [ASSET_IDS.sprites.enemyGuard]: enemyGuardUrl,
    [ASSET_IDS.sprites.enemyWalk1]: enemyWalk1Url,
    [ASSET_IDS.sprites.enemyWalk2]: enemyWalk2Url,
    [ASSET_IDS.sprites.enemyWalk3]: enemyWalk3Url,
    [ASSET_IDS.sprites.decoration]: decorationCrystalsUrl,
    [ASSET_IDS.sprites.bullet]: bulletPlasmaUrl,
    [ASSET_IDS.sprites.redKeycard]: svgToDataUrl(redKeycardSvg),
    [ASSET_IDS.sprites.greenKeycard]: svgToDataUrl(greenKeycardSvg),
  },
  wallTextures: {
    1: ASSET_IDS.walls.stone,
    2: ASSET_IDS.walls.metal,
  },
}

export function resolveAssetSource(assetRef: AssetRef | undefined, manifest: AssetManifest = assetManifest) {
  if (!assetRef) return fallbackImageSource()
  if (manifest.images[assetRef]) return manifest.images[assetRef]
  if (isDirectImageSource(assetRef)) return assetRef
  return fallbackImageSource()
}

export function createImageAsset(assetRef: AssetRef, manifest: AssetManifest = assetManifest) {
  const img = new Image()
  const src = resolveAssetSource(assetRef, manifest)
  if (isRemoteUrl(src)) {
    img.crossOrigin = 'anonymous'
  }
  img.src = src
  return img
}

export function createWallTextureArray(manifest: AssetManifest = assetManifest): WallTextureArray {
  const walls: WallTextureArray = []
  Object.entries(manifest.wallTextures).forEach(([tileId, assetId]) => {
    walls[Number(tileId)] = createImageAsset(assetId, manifest)
  })
  return walls
}

export function fallbackImageSource() {
  return svgToDataUrl(missingAssetSvg)
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function isRemoteUrl(src: string) {
  return /^https?:\/\//.test(src)
}

function isDirectImageSource(src: string) {
  return (
    isRemoteUrl(src) ||
    /^(data|blob):/.test(src) ||
    src.startsWith('/') ||
    src.startsWith('./') ||
    src.startsWith('../') ||
    /\.(avif|gif|jpe?g|png|svg|webp)([?#].*)?$/i.test(src)
  )
}
