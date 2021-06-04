const useCaseMap = new Map([
  [
    'one',
    {
      url: 'http://localhost:3002/remoteEntry.js',
      scope: 'useCaseOne',
      module: './entry',
    },
  ],
])

async function loadComponent(scope, module) {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default')
  const container = window[scope] // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default)
  const factory = await window[scope].get(module)
  const Module = factory()
  return Module
}

function loadUseCase(url: string) {
  const element = document.createElement('script')

  element.src = url
  element.type = 'text/javascript'
  element.async = true

  const promise = new Promise((resolve, reject) => {
    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`)
      resolve(true)
    }

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${url}`)
      reject(false)
    }
  })

  document.head.appendChild(element)

  return promise
}

export default function bootstrap({ useCase, ...args } = {}) {
  const { url, scope, module } = useCaseMap.get(useCase)

  loadUseCase(url)
    .then(() => loadComponent(scope, module))
    .then(({ bootstrap: boot }) => boot(args))

  // await loadUseCase(url)
  // const { bootstrap: boot } = await loadComponent(useCase, './entry')
  // boot(args)
}

// Calling the bootstrap function here instead of the HTML file
// because webpack-dev-server has an issue with exports right now:
// https://github.com/webpack/webpack/issues/11887
// When building & serving the projects it also works
// as umd library.
bootstrap({ useCase: 'one' })
