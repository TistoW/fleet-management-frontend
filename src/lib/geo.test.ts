import { expect, it } from 'vitest'
import { decodePolyline, splitAtClosest } from './geo'

it('decodes the reference encoded polyline from the Google docs', () => {
  const pts = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')
  expect(pts).toEqual([
    [38.5, -120.2],
    [40.7, -120.95],
    [43.252, -126.453],
  ])
})

it('splits a line at the point closest to the vehicle', () => {
  const line: [number, number][] = [
    [0, 0],
    [0, 1],
    [0, 2],
  ]
  const { passed, ahead } = splitAtClosest(line, [0.1, 1.5])
  expect(passed).toEqual([[0, 0], [0, 1], [0, 1.5]])
  expect(ahead).toEqual([[0, 1.5], [0, 2]])
})

it('clamps to the ends and tolerates a degenerate line', () => {
  expect(splitAtClosest([[0, 0], [0, 1]], [0, -5]).passed).toEqual([[0, 0], [0, 0]])
  expect(splitAtClosest([[0, 0]], [1, 1])).toEqual({ passed: [], ahead: [[0, 0]] })
})
