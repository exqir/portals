interface UseCase {
  url: string
  scope: string
  module: string
}

const useCaseMap = new Map<'one', UseCase>([
  [
    'one',
    {
      url: 'http://localhost:3002/remoteEntry.js',
      scope: 'useCaseOne',
      module: './entry',
    },
  ],
])

async function loadComponent(scope: string, module: string) {
  // @ts-expect-error
  await __webpack_init_sharing__('default')
  // @ts-expect-error
  const container = window[scope] // or get the container somewhere else
  // @ts-expect-error
  await container.init(__webpack_share_scopes__.default)
  // @ts-expect-error
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

interface Bootstrap {
  useCase: 'one'
  [key: string]: any
}

export default function bootstrap({ useCase, ...args }: Bootstrap) {
  const options = useCaseMap.get(useCase)

  if (typeof options === 'undefined')
    throw new Error(`UseCase ${useCase} is not supported.`)

  const { url, scope, module } = options

  loadUseCase(url)
    .then(() => loadComponent(scope, module))
    .then(({ bootstrap: boot }) => boot(args))
}

// Calling the bootstrap function here instead of the HTML file
// because webpack-dev-server has an issue with exports right now:
// https://github.com/webpack/webpack/issues/11887
// When building & serving the projects it also works
// as umd library.
bootstrap({ useCase: 'one' })
