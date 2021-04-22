import React from 'react'

const LazyConnectComponent = React.lazy(() =>
  import("../../components/Connect")
)
const LazyProfileComponent = React.lazy(() =>
  import("../../components/Profile")
)

export default function Index() {
  const isSSR = typeof window === "undefined"

  return (
    <div>
      <h2>Login</h2>

      {!isSSR && (
          <React.Suspense fallback={<div />}>
            <LazyConnectComponent />
            <LazyProfileComponent />
          </React.Suspense>
      )}
    </div>
  )
}
