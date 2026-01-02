const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('node:path')

// Find the project and workspace directories
const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot]

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
]

// 3. Map workspace packages to their actual locations
// This ensures Metro can find @shared/* and @packages/* packages
config.resolver.extraNodeModules = {
    '@shared/api': path.resolve(monorepoRoot, 'shared/api'),
    '@shared/auth': path.resolve(monorepoRoot, 'shared/auth'),
    '@shared/lib': path.resolve(monorepoRoot, 'shared/lib'),
    '@packages/posts': path.resolve(monorepoRoot, 'packages/posts'),
}

// 4. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true

module.exports = withNativeWind(config, { input: './src/global.css' })
