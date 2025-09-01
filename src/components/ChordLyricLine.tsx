import React from 'react';
import { ParsedLine } from '@/lib/chordParser';

interface ChordLyricLineProps {
  parsedLine: ParsedLine;
  className?: string;
  fontSize?: number;
}

const ChordLyricLine: React.FC<ChordLyricLineProps> = ({
  parsedLine,
  className = '',
  fontSize = 16,
}) => {
  const { lyrics, chords } = parsedLine;

  // Tokenize line: each character and matching chord if present
  const tokens = lyrics.split('').map((char, i) => {
    const matchingChord = chords.find((ch) => ch.position === i);
    return {
      char,
      chord: matchingChord?.chord || '',
    };
  });

  return (
    <div
      className={`mb-2 font-mono flex flex-wrap ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: 1.4,
      }}
    >
      {tokens.map((token, idx) => (
        <span
          key={idx}
          className="flex flex-col items-center min-w-[0.6ch]"
        >
          <span
            className="text-blue-600 font-bold leading-none h-[1.2em]"
            style={{ minHeight: `${fontSize}px` }}
          >
            {token.chord || '\u00A0'}
          </span>
          <span className="leading-none">{token.char}</span>
        </span>
      ))}
    </div>
  );
};

export default ChordLyricLine;
