

export type Direction = 'up' | 'down';

export interface Interval {
  diatonic: number; // e.g., 4 = perfect 4th
  chromatic: number; // e.g., +5 semitones
}

const steps = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const alters = ['bb', 'b', '', '#', 'x'] as const;
const values = [0, 2, 4, 5, 7, 9, 11];

function stepToIndex(step: string): number {
  return steps.indexOf(step as any);
}

function indexToStep(i: number): string {
  return steps[i];
}

function alterToInt(alter = ''): number {
  return alters.indexOf(alter as any) - 2; // '' = 0
}

function intToAlter(i: number): string {
  return alters[i + 2];
}

function stepToVal(i: number): number {
  return values[i] ?? '*';
}

export function isPrimary(diatonic: number): boolean {
  return [0, 3, 4].includes(diatonic); // 1st, 4th, 5th
}

export function makeInterval(
  dir: Direction,
  diatonic: number,
  primary: number,
  secondary: number
): Interval {
  let chromatic = stepToVal(diatonic);
  chromatic += isPrimary(diatonic) ? primary : secondary;
  if (dir !== 'up') {
    diatonic = -diatonic;
    chromatic = -chromatic;
  }
  return { diatonic, chromatic };
}

export function transpose(note: [string, string?], interval: Interval): [string, string] {
  let [step, alter = ''] = note;
  let stepIdx = stepToIndex(step);
  let alterVal = alterToInt(alter);
  alterVal += stepToVal(stepIdx);
  stepIdx += interval.diatonic;
  alterVal += interval.chromatic;
  while (stepIdx < 0) {
    stepIdx += 7;
    alterVal += 12;
  }
  while (stepIdx >= 7) {
    stepIdx -= 7;
    alterVal -= 12;
  }
  alterVal -= stepToVal(stepIdx);
  return [indexToStep(stepIdx), intToAlter(alterVal)];
}

export function computeInterval(from: [string, string?], to: [string, string?]): Interval {
  let [fStep, fAlter = ''] = from;
  let [tStep, tAlter = ''] = to;
  let fIdx = stepToIndex(fStep);
  let fVal = alterToInt(fAlter) + stepToVal(fIdx);
  let tIdx = stepToIndex(tStep);
  let tVal = alterToInt(tAlter) + stepToVal(tIdx);
  let diatonic = tIdx - fIdx;
  let chromatic = tVal - fVal;
  if (diatonic > 3) {
    diatonic -= 7;
    chromatic -= 12;
  } else if (diatonic < -3) {
    diatonic += 7;
    chromatic += 12;
  }
  return { diatonic, chromatic };
}

export function invertInterval(interval: Interval): [Direction, number, number] {
  let { diatonic, chromatic } = interval;
  let dir: Direction = 'up';
  if (diatonic < 0 || (diatonic === 0 && chromatic < 0)) {
    dir = 'down';
    diatonic = -diatonic;
    chromatic = -chromatic;
  }
  chromatic -= stepToVal(diatonic);
  return [dir, diatonic, chromatic];
}
