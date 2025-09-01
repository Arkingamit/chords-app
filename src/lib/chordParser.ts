import { Chord, Note, Interval } from '@tonaljs/tonal';

export interface ChordPosition {
  chord: string;
  position: number;
}

export interface ParsedLine {
  lyrics: string;
  chords: ChordPosition[];
}

/**
 * Parse a line with chords in [chord] format and return structured data
 */
export function parseLineWithChords(line: string): ParsedLine {
  const chords: ChordPosition[] = [];
  let lyrics = '';
  let currentPos = 0;
  let lyricsPos = 0;

  const chordRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    const chordStart = match.index;
    const chord = match[1];
    
    // Add text before this chord to lyrics
    const textBefore = line.substring(currentPos, chordStart);
    lyrics += textBefore;
    lyricsPos += textBefore.length;
    
    // Add chord at current lyrics position
    chords.push({
      chord,
      position: lyricsPos
    });
    
    currentPos = chordStart + match[0].length;
  }
  
  // Add remaining text after last chord
  lyrics += line.substring(currentPos);
  
  return { lyrics, chords };
}

/**
 * Format chord display according to requirements
 */
function formatChordDisplay(chord: string): string {
  // Remove "major" from chord names
  let formatted = chord.replace(/major/gi, '');
  
  // Replace "Minor" with "m" (case sensitive to handle both cases)
  formatted = formatted.replace(/Minor/g, 'm');
  formatted = formatted.replace(/minor/g, 'm');
  
  return formatted;
}

/**
 * Transpose a chord using Tonal library
 */
export function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
  if (!chord || semitones === 0) {
    return formatChordDisplay(chord);
  }

  try {
    const chordObj = Chord.get(chord);
    
    if (!chordObj.tonic) {
      // Try as a simple note
      const transposedNote = Note.transpose(chord, Interval.fromSemitones(semitones));
      const result = useFlats ? Note.enharmonic(transposedNote) : transposedNote || chord;
      return formatChordDisplay(result);
    }

    // Transpose the root note
    const transposedRoot = Note.transpose(chordObj.tonic, Interval.fromSemitones(semitones));
    const finalRoot = useFlats ? Note.enharmonic(transposedRoot) : transposedRoot;
    
    // Handle slash chords
    let result = finalRoot + chordObj.quality;
    
    if (chord.includes('/')) {
      const parts = chord.split('/');
      if (parts.length === 2) {
        const bassNote = parts[1];
        const transposedBass = Note.transpose(bassNote, Interval.fromSemitones(semitones));
        const finalBass = useFlats ? Note.enharmonic(transposedBass) : transposedBass;
        result = result + '/' + finalBass;
      }
    }
    
    return formatChordDisplay(result);
  } catch (error) {
    console.warn(`Failed to transpose chord: ${chord}`, error);
    return formatChordDisplay(chord);
  }
}

/**
 * Transpose all chords in a parsed line
 */
export function transposeParsedLine(parsedLine: ParsedLine, semitones: number, useFlats: boolean = false): ParsedLine {
  if (semitones === 0) {
    return {
      lyrics: parsedLine.lyrics,
      chords: parsedLine.chords.map(chordPos => ({
        ...chordPos,
        chord: formatChordDisplay(chordPos.chord)
      }))
    };
  }
  
  return {
    lyrics: parsedLine.lyrics,
    chords: parsedLine.chords.map(chordPos => ({
      ...chordPos,
      chord: transposeChord(chordPos.chord, semitones, useFlats)
    }))
  };
}