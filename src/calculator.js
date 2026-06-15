export const DISTANCES = {
  '5k':   5,
  '10k':  10,
  'half': 21.0975,
  '30k':  30,
  'full': 42.195,
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
  return (3600 / paceSec).toFixed(1)
}

export function calcCadence(paceSec) {
  const raw = 180 + ((300 - paceSec) / 30) * 3
  return Math.round(Math.min(200, Math.max(155, raw)))
}

export function calcStrideLength(paceSec) {
  const cadence = calcCadence(paceSec)
  const speedMPerMin = (1000 / paceSec) * 60
  return (speedMPerMin / (cadence / 2)).toFixed(2)
}

export function generateSplits(paceSec, distKm, intervalKm, splitType) {
  const numSegments = Math.ceil(distKm / intervalKm)
  const splits = []
  let cumTime = 0
  let lastChunkCumTime = 0
  const halfDist = 21.0975

  for (let i = 0; i < numSegments; i++) {
    const segStart = i * intervalKm
    const segEnd = Math.min(segStart + intervalKm, distKm)
    const segDistance = segEnd - segStart
    const relPos = i / numSegments

    let multiplier = 1.0
    if (splitType === 'neg') multiplier = 1 + 0.04 * (0.5 - relPos)
    if (splitType === 'pos') multiplier = 1 - 0.04 * (0.5 - relPos)

    const lapPace = paceSec * multiplier
    const lapTime = lapPace * segDistance
    const cumTimeBefore = cumTime
    cumTime += lapTime

    const isFinish = Math.abs(segEnd - distKm) < 0.001
    const is5kMark = !isFinish && segEnd % 5 < 0.001

    // Insert Half marker row when this segment crosses the half marathon mark
    if (distKm > halfDist && segStart < halfDist && segEnd > halfDist) {
      const halfLapTime = lapPace * (halfDist - segStart)
      splits.push({
        distLabel: 'Half',
        segEnd: halfDist,
        lapTime: halfLapTime,
        cumTime: cumTimeBefore + halfLapTime,
        lapPace,
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
