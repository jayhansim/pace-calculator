export const DISTANCES = {
  '5k':   5,
  '10k':  10,
  'half': 21.0975,
  '30k':  30,
  'full': 42.195,
}

export const SPLIT_SEGMENTS = {
  '5k':   { first: 1.0,     last: 1.0 },
  '10k':  { first: 3.0,     last: 3.0 },
  'half': { first: 5.0,     last: 5.0975 },
  '30k':  { first: 10.0,    last: 10.0 },
  'full': { first: 21.0975, last: 21.0975 },
}

export const SPLIT_FIRST_LABEL = {
  '5k': '1K', '10k': '3K', 'half': '5K', '30k': '10K', 'full': 'half',
}

export function formatPace(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return { min: String(m), sec: String(s).padStart(2, '0') }
}

export function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.round(totalSeconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function calcTotalTime(paceSec, distKm) {
  return paceSec * distKm
}

export function calcSpeed(paceSec) {
  return (3600 / paceSec).toFixed(2)
}

export function calcCadence(paceSec) {
  const raw = 180 + ((330 - paceSec) / 30) * 3
  return Math.round(Math.min(200, Math.max(155, raw)))
}

export function calcStrideLength(paceSec, cadence) {
  const speedMPerMin = (1000 / paceSec) * 60
  return (speedMPerMin / cadence).toFixed(2)
}

function buildMacroSegments(paceSec, distKm, splitType, distanceKey, deltaSec) {
  if (splitType === 'even' || !deltaSec) {
    return [{ start: 0, end: distKm, pace: paceSec }]
  }

  const { first, last } = SPLIT_SEGMENTS[distanceKey]
  const middle = distKm - first - last
  const sign = splitType === 'neg' ? 1 : -1
  const firstPace = paceSec + sign * deltaSec
  const lastPace = paceSec - sign * deltaSec

  const segments = [{ start: 0, end: first, pace: firstPace }]
  if (middle > 0.0001) {
    const totalTime = paceSec * distKm
    const middlePace = (totalTime - firstPace * first - lastPace * last) / middle
    segments.push({ start: first, end: first + middle, pace: middlePace })
  }
  segments.push({ start: distKm - last, end: distKm, pace: lastPace })
  return segments
}

function timeForRange(segments, rangeStart, rangeEnd) {
  let time = 0
  for (const seg of segments) {
    const overlapStart = Math.max(rangeStart, seg.start)
    const overlapEnd = Math.min(rangeEnd, seg.end)
    if (overlapEnd > overlapStart) time += (overlapEnd - overlapStart) * seg.pace
  }
  return time
}

export function generateSplits(paceSec, distKm, intervalKm, splitType, distanceKey, deltaSec) {
  const numSegments = Math.ceil(distKm / intervalKm)
  const macroSegments = buildMacroSegments(paceSec, distKm, splitType, distanceKey, deltaSec)
  const splits = []
  let cumTime = 0
  let lastChunkCumTime = 0
  const halfDist = 21.0975

  for (let i = 0; i < numSegments; i++) {
    const segStart = i * intervalKm
    const segEnd = Math.min(segStart + intervalKm, distKm)
    const segDistance = segEnd - segStart

    const lapTime = timeForRange(macroSegments, segStart, segEnd)
    const lapPace = lapTime / segDistance
    const cumTimeBefore = cumTime
    cumTime += lapTime

    const isFinish = Math.abs(segEnd - distKm) < 0.001
    const is5kMark = !isFinish && segEnd % 5 < 0.001

    // Insert Half marker row when this segment crosses the half marathon mark
    if (distanceKey === 'full' && segStart < halfDist && segEnd > halfDist) {
      const halfLapTime = timeForRange(macroSegments, segStart, halfDist)
      splits.push({
        distLabel: 'Half',
        segEnd: halfDist,
        lapTime: halfLapTime,
        cumTime: cumTimeBefore + halfLapTime,
        lapPace: halfLapTime / (halfDist - segStart),
        isHighlight: true,
        is5kMark: false,
        chunkTime: null,
      })
    }

    let chunkTime = null
    if (is5kMark || isFinish) {
      chunkTime = cumTime - lastChunkCumTime
      lastChunkCumTime = cumTime
    }

    let distLabel
    if (isFinish) {
      distLabel = 'Finish'
    } else if (Number.isInteger(segEnd) || intervalKm >= 5) {
      distLabel = `${segEnd % 1 === 0 ? segEnd : segEnd.toFixed(1)}K`
    } else {
      distLabel = `${segEnd.toFixed(1)}K`
    }

    splits.push({
      distLabel,
      segEnd,
      lapTime,
      cumTime,
      lapPace,
      isHighlight: isFinish,
      is5kMark,
      chunkTime,
    })
  }
  return splits
}
