import React from 'react'
import { Route as RRRoute, RouteProps } from 'react-router-dom'
import { registerRoutePath } from './routeRegistry'

export function TrackedRoute(props: RouteProps) {
  React.useEffect(() => {
    // @ts-ignore path may be string | undefined
    registerRoutePath(props.path as any)
  }, [props.path])
  // @ts-ignore props spread
  return <RRRoute {...props} />
}


